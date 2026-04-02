const fs = require('fs');
const path = require('path');

const uiComponents = ['Sidebar', 'DapodikStatus', 'ClassSelector'];
const adminComponents = ['UserRoleActions', 'UserTableControls', 'SiswaTableControls', 'GuruTableControls', 'AdminJadwalClient', 'SchoolProfileCard'];
const syncComponents = ['SyncButton', 'SyncPTKButton', 'SyncSekolahButton'];

const getAllFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
};

const replaceImports = (files) => {
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        uiComponents.forEach(cmp => {
            const regex = new RegExp(`@/components/${cmp}(?!/)`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `@/components/ui/${cmp}`);
                modified = true;
            }
        });

        adminComponents.forEach(cmp => {
            const regex = new RegExp(`@/components/${cmp}(?!/)`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `@/components/admin/${cmp}`);
                modified = true;
            }
        });

        syncComponents.forEach(cmp => {
            const regex = new RegExp(`@/components/${cmp}(?!/)`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `@/components/sync/${cmp}`);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated imports in ${file}`);
        }
    });
};

const appFiles = getAllFiles(path.join(__dirname, 'app'));
const compFiles = getAllFiles(path.join(__dirname, 'components'));
replaceImports([...appFiles, ...compFiles]);

console.log("Selesai memperbarui impor di files");
