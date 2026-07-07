param(
  [string]$Source = "C:\Users\PC\Desktop\Tinytalk\TinyTalk_Content_First10.xlsx",
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

$zip = [System.IO.Compression.ZipFile]::OpenRead($Source)

try {
  [xml]$topicsSheet = Read-ZipEntry $zip "xl/worksheets/sheet1.xml"
  [xml]$turnsSheet = Read-ZipEntry $zip "xl/worksheets/sheet2.xml"

  $topicRows = Get-Rows $topicsSheet
  $turnRows = Get-Rows $turnsSheet

  $topics = @()

  foreach ($topicRow in $topicRows) {
    $topicId = [int]$topicRow.id
    $turns = @(
      $turnRows |
        Where-Object { [int]$_.topic_id -eq $topicId } |
        Sort-Object { [int]$_.turn } |
        ForEach-Object {
          [ordered]@{
            order = [int]$_.turn
            speaker = if ($_.speaker -eq "tinytalk") { "app" } else { $_.speaker }
            text = $_.english
            translation = $_.vietnamese
            acceptableVariants = @()
            allowPass = $_.can_skip -eq "1" -or $_.can_skip -eq "TRUE"
          }
        }
    )

    $topics += ,[ordered]@{
      id = $topicId
      order = [int]$topicRow.lesson_order
      title = $topicRow.title
      level = "starter"
      situation = $topicRow.description
      tags = Split-List $topicRow.tags
      keywords = Split-List $topicRow.keywords
      isActive = $true
      turns = $turns
    }
  }

  $json = $topics | ConvertTo-Json -Depth 20

  $outputPath = Join-Path (Get-Location) $Output
  $deployOutputPath = Join-Path (Get-Location) $DeployOutput

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outputPath) | Out-Null
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $deployOutputPath) | Out-Null

  [System.IO.File]::WriteAllText($outputPath, $json, [System.Text.Encoding]::UTF8)
  [System.IO.File]::WriteAllText($deployOutputPath, $json, [System.Text.Encoding]::UTF8)

  Write-Host "Generated $($topics.Count) topics."
}
finally {
  $zip.Dispose()
}
