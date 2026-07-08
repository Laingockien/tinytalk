param(
  [string[]]$Source = @(
    "C:\Users\PC\Desktop\Tinytalk\TinyTalk_Batch01_PartA_Lesson01-10.xlsx",
    "C:\Users\PC\Desktop\Tinytalk\TinyTalk_Batch01_PartB_Lesson11-20.xlsx",
    "C:\Users\PC\Desktop\Tinytalk\TinyTalk_Batch01_PartC_Lesson21-30.xlsx"
  ),
  [string]$Output = "public\data\topics.json",
  [string]$DeployOutput = "data\topics.json"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-ZipEntry {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$Name
  )

  $entry = $Zip.GetEntry($Name.TrimStart("/"))
  if ($null -eq $entry) {
    throw "Missing Excel entry: $Name"
  }

  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    return $reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }
}

function Get-ColumnName {
  param([string]$CellRef)
  return ($CellRef -replace "\d", "")
}

function Get-CellText {
  param($Cell)

  if ($Cell.t -eq "inlineStr") {
    return [string]$Cell.is.t
  }

  if ($Cell.v) {
    return [string]$Cell.v
  }

  return ""
}

function Get-Rows {
  param([xml]$SheetXml)

  $rows = @()
  foreach ($row in $SheetXml.worksheet.sheetData.row) {
    $values = @{}
    foreach ($cell in $row.c) {
      $values[(Get-ColumnName $cell.r)] = (Get-CellText $cell).Trim()
    }
    $rows += ,$values
  }

  if ($rows.Count -lt 2) {
    return @()
  }

  $headers = $rows[0]
  $items = @()

  foreach ($row in $rows[1..($rows.Count - 1)]) {
    $item = [ordered]@{}
    foreach ($column in $headers.Keys) {
      $header = $headers[$column]
      if ([string]::IsNullOrWhiteSpace($header)) {
        continue
      }
      $item[$header] = $row[$column]
    }
    $items += ,[pscustomobject]$item
  }

  return $items
}

function Split-List {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return @()
  }

  return @(
    $Value -split "," |
      ForEach-Object { $_.Trim() } |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  )
}

$topics = @()

foreach ($sourceFile in $Source) {
  $zip = [System.IO.Compression.ZipFile]::OpenRead($sourceFile)

  try {
    [xml]$topicsSheet = Read-ZipEntry $zip "xl/worksheets/sheet1.xml"
    [xml]$turnsSheet = Read-ZipEntry $zip "xl/worksheets/sheet2.xml"

    $topicRows = Get-Rows $topicsSheet
    $turnRows = Get-Rows $turnsSheet

    foreach ($topicRow in $topicRows) {
      $topicId = [int]$topicRow.id
      $turns = @(
        $turnRows |
          Where-Object { [int]$_.topic_id -eq $topicId } |
          Sort-Object { [int]$_.turn } |
          ForEach-Object {
            $speaker = if ($_.speaker -eq "parent") { "parent" } else { "app" }
            $emotion = if ($speaker -eq "app" -and $_.emotion) { $_.emotion } else { "neutral" }
            [ordered]@{
              order = [int]$_.turn
              speaker = $speaker
              text = $_.english
              translation = $_.vietnamese
              emotion = $emotion
              acceptableVariants = @()
              allowPass = $_.can_skip -eq "1" -or $_.can_skip -eq "TRUE"
            }
          }
      )

      $tagsValue = if ($topicRow.tags) { $topicRow.tags } else { $topicRow.related_keywords }

      $topics += ,[ordered]@{
        id = $topicId
        order = [int]$topicRow.lesson_order
        title = $topicRow.title
        level = "starter"
        situation = $topicRow.description
        tags = Split-List $tagsValue
        keywords = Split-List $topicRow.keywords
        isActive = $true
        turns = $turns
      }
    }
  }
  finally {
    $zip.Dispose()
  }
}

$topics = @($topics | Sort-Object { [int]$_["order"] })

$json = $topics | ConvertTo-Json -Depth 20 -Compress

$outputPath = Join-Path (Get-Location) $Output
$deployOutputPath = Join-Path (Get-Location) $DeployOutput

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outputPath) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $deployOutputPath) | Out-Null

[System.IO.File]::WriteAllText($outputPath, $json, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($deployOutputPath, $json, [System.Text.Encoding]::UTF8)

Write-Host "Generated $($topics.Count) topics."
