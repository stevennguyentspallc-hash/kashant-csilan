$project = "$env:USERPROFILE\Desktop\kashant-csilan"
$dl = "$env:USERPROFILE\Downloads"

Set-Location $project
Write-Host "Copying files..." -ForegroundColor Cyan

$z = "$dl\latest-fix\kashant-csilan"
if (Test-Path $z) {
    $src = "$z\src\app\robots.ts"
    if (Test-Path $src) { Copy-Item -Force $src "$project\src\app\robots.ts"; Write-Host "OK: robots.ts" -ForegroundColor Green }
    $src2 = "$z\src\app\api\quote\route.ts"
    if (Test-Path $src2) { Copy-Item -Force $src2 "$project\src\app\api\quote\route.ts"; Write-Host "OK: route.ts" -ForegroundColor Green }
}

$z = "$dl\banners\kashant-csilan"
if (Test-Path $z) {
    $src = "$z\src\components\admin\AdminSidebar.tsx"
    if (Test-Path $src) { Copy-Item -Force $src "$project\src\components\admin\AdminSidebar.tsx"; Write-Host "OK: AdminSidebar" -ForegroundColor Green }
    $src2 = "$z\src\components\home"
    if (Test-Path $src2) {
        $dst2 = "$project\src\components\home"
        if (-not (Test-Path $dst2)) { New-Item -ItemType Directory -Force $dst2 | Out-Null }
        Copy-Item -Recurse -Force "$src2\*" $dst2
        Write-Host "OK: components/home" -ForegroundColor Green
    }
    $src3 = "$z\src\app\admin"
    if (Test-Path $src3) { Copy-Item -Recurse -Force "$src3\*" "$project\src\app\admin"; Write-Host "OK: admin/banners" -ForegroundColor Green }
}

$z = "$dl\gallery\kashant-csilan"
if (Test-Path $z) {
    $src = "$z\src\components\admin\AdminSidebar.tsx"
    if (Test-Path $src) { Copy-Item -Force $src "$project\src\components\admin\AdminSidebar.tsx"; Write-Host "OK: AdminSidebar gallery" -ForegroundColor Green }
    $src2 = "$z\src\app\admin"
    if (Test-Path $src2) { Copy-Item -Recurse -Force "$src2\*" "$project\src\app\admin"; Write-Host "OK: admin/gallery" -ForegroundColor Green }
}

$z = "$dl\mobile-admin\kashant-csilan"
if (Test-Path $z) {
    $src = "$z\src\app\admin"
    if (Test-Path $src) { Copy-Item -Recurse -Force "$src\*" "$project\src\app\admin"; Write-Host "OK: mobile-admin" -ForegroundColor Green }
    $src2 = "$z\src\components\admin\AdminSidebar.tsx"
    if (Test-Path $src2) { Copy-Item -Force $src2 "$project\src\components\admin\AdminSidebar.tsx"; Write-Host "OK: AdminSidebar mobile" -ForegroundColor Green }
}

$z = "$dl\seo-fix\kashant-csilan"
if (Test-Path $z) {
    $files = "src\app\sitemap.ts","src\app\robots.ts","src\app\layout.tsx"
    foreach ($f in $files) {
        $src = "$z\$f"
        if (Test-Path $src) { Copy-Item -Force $src "$project\$f"; Write-Host "OK: $f" -ForegroundColor Green }
    }
}

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "Deploy all fixes"
git push
Write-Host "`nDone!" -ForegroundColor Green
