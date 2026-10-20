Add-Type -AssemblyName System.IO.Compression.FileSystem
$documents = @('C:/Users/Sahil Sahu/Downloads/Subscription_Retention_Cliff_Case_Study.docx','C:/Users/Sahil Sahu/Downloads/Bhopal_Clothing_Brand_Case_Study.docx','src/aarthik case study.docx')
foreach ($document in $documents) {
 $zip=[System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $document))
 $reader=New-Object System.IO.StreamReader($zip.GetEntry('word/document.xml').Open()); [xml]$xml=$reader.ReadToEnd();$reader.Close()
 $ns=New-Object System.Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
 $blocks=@()
 foreach($node in $xml.SelectSingleNode('//w:body',$ns).ChildNodes){
  if($node.LocalName -eq 'p'){
   $text=($node.SelectNodes('.//w:t | .//w:br | .//w:tab',$ns) | ForEach-Object {if($_.LocalName -eq 'br'){"`n"}elseif($_.LocalName -eq 'tab'){"`t"}else{$_.InnerText}})-join ''
   $style='';$styleNode=$node.SelectSingleNode('w:pPr/w:pStyle',$ns);if($styleNode){$style=$styleNode.GetAttribute('val','http://schemas.openxmlformats.org/wordprocessingml/2006/main')}
   if($text){$blocks+=@{type='paragraph';style=$style;text=$text}}
  }elseif($node.LocalName -eq 'tbl'){
   $rows=@($node.SelectNodes('w:tr',$ns)|ForEach-Object{,@($_.SelectNodes('w:tc',$ns)|ForEach-Object{($_.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText})-join ' '})})
   $blocks+=@{type='table';rows=$rows}
  }
 }
 $name=[System.IO.Path]::GetFileNameWithoutExtension($document)
 @{name=$name;blocks=$blocks;media=@($zip.Entries|Where-Object FullName -Like 'word/media/*'|ForEach-Object FullName)}|ConvertTo-Json -Depth 10|Set-Content -Encoding utf8 "artifacts/case-studies/$name.json"
 $blocks|ForEach-Object{if($_.type -eq 'table'){($_.rows|ForEach-Object{$_ -join ' | '})-join "`n"}else{"[$($_.style)] $($_.text)"}}|Set-Content -Encoding utf8 "artifacts/case-studies/$name.txt"
 Write-Output "$name : $($blocks.Count) blocks"
 $zip.Dispose()
}
