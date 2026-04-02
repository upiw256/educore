@echo off
cd /d d:\Js\educore
mkdir components\ui
mkdir components\admin
mkdir components\sync
move components\Sidebar.tsx components\ui\
move components\DapodikStatus.tsx components\ui\
move components\ClassSelector.tsx components\ui\
move components\UserRoleActions.tsx components\admin\
move components\UserTableControls.tsx components\admin\
move components\SiswaTableControls.tsx components\admin\
move components\GuruTableControls.tsx components\admin\
move components\AdminJadwalClient.tsx components\admin\
move components\SchoolProfileCard.tsx components\admin\
move components\SyncButton.tsx components\sync\
move components\SyncPTKButton.tsx components\sync\
move components\SyncSekolahButton.tsx components\sync\
del /f /q components\ChangePasswordModal.tsx
del /f /q components\JadwalUploader.tsx
rmdir /S /Q constants
exit
