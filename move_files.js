const fs = require('fs');
const path = require('path');

const moveFiles = () => {
    const root = path.join(__dirname, 'components');
    const dirs = ['ui', 'admin', 'sync'];
    
    dirs.forEach(d => {
        const dirPath = path.join(root, d);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    const uiComponents = ['Sidebar.tsx', 'DapodikStatus.tsx', 'ClassSelector.tsx'];
    const adminComponents = ['UserRoleActions.tsx', 'UserTableControls.tsx', 'SiswaTableControls.tsx', 'GuruTableControls.tsx', 'AdminJadwalClient.tsx', 'SchoolProfileCard.tsx'];
    const syncComponents = ['SyncButton.tsx', 'SyncPTKButton.tsx', 'SyncSekolahButton.tsx'];

    uiComponents.forEach(file => {
        if(fs.existsSync(path.join(root, file))) fs.renameSync(path.join(root, file), path.join(root, 'ui', file));
    });
    
    adminComponents.forEach(file => {
        if(fs.existsSync(path.join(root, file))) fs.renameSync(path.join(root, file), path.join(root, 'admin', file));
    });

    syncComponents.forEach(file => {
        if(fs.existsSync(path.join(root, file))) fs.renameSync(path.join(root, file), path.join(root, 'sync', file));
    });

    // Delete unused
    ['ChangePasswordModal.tsx', 'JadwalUploader.tsx'].forEach(file => {
        if(fs.existsSync(path.join(root, file))) fs.unlinkSync(path.join(root, file));
    });

    // Delete constants param
    const constantsPath = path.join(__dirname, 'constants');
    if (fs.existsSync(constantsPath)) {
        fs.rmSync(constantsPath, { recursive: true, force: true });
    }
}

moveFiles();
console.log('Moved files successfully');
