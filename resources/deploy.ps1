# Cleaning Folder ----------------------------------------------
"Cleaning folder"

Get-ChildItem -Path 'D:\home\site\wwwroot' -Recurse |
Select -ExpandProperty FullName |
Where {$_ -notlike 'D:\home\site\wwwroot\App_Data*' -and $_ -notlike 'D:\home\site\wwwroot\node_modules*'} |
sort length -Descending
Remove-Item

# Unzip --------------------------------------------------------
"Unzipping folder"
cd "D:\home\site\temp"
unzip -o -d D:\home\site\wwwroot\ deployment.zip

# NPM
cd "D:\home\site\wwwroot"
"Running npm install (production)"
npm install --production --no-optional --no-bin-links

# Cleanup ------------------------------------------------------
"We're done, cleaning up!"
cd "D:\home\site\temp\"
Remove-Item -Path ./deployment.zip

# Done ---------------------------------------------------------
"All done!"
