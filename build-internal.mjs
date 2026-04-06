import { compilePack } from '@foundryvtt/foundryvtt-cli';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function build() {
    const sysRef = path.resolve('.sra2-system-ref');
    const tempSrc = path.resolve('_temp_src_internal');
    const packDest = path.resolve('packs', 'anarchy-objets');

    // Clean
    [tempSrc, packDest].forEach(d => { if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); });
    fs.mkdirSync(tempSrc, { recursive: true });
    fs.mkdirSync(packDest, { recursive: true });

    // 1. Get templates from HEAD to extract required system defaults
    console.log("Lecture des templates système actuels...");
    const templates = {};
    const headFiles = execSync(`git -C "${sysRef}" ls-tree --name-only HEAD src/packs/anarchy-items-fr/`).toString().trim().split('\n').filter(Boolean);
    
    // Auto-detect one template of each type
    for (const file of headFiles) {
        if (!file.endsWith('.json') || file.startsWith('folders_')) continue;
        try {
            const content = JSON.parse(execSync(`git -C "${sysRef}" show "HEAD:${file}"`, { encoding: 'utf8' }));
            if (content.type && !templates[content.type]) {
                templates[content.type] = content.system;
            }
        } catch (e) {}
    }

    // 2. Extract 611 JSONs from git (the old commit)
    const fileList = execSync(`git -C "${sysRef}" ls-tree --name-only "797813f^" src/packs/anarchy-objets/`)
        .toString().trim().split('\n').filter(Boolean);
    
    console.log(`Extraction et Migration de ${fileList.length} fichiers...`);
    for (const filePath of fileList) {
        const raw = execSync(`git -C "${sysRef}" show "797813f^:${filePath}"`, { encoding: 'utf8' });
        const item = JSON.parse(raw);

        // Apply migration if it's an item (not a folder)
        if (item.type && templates[item.type]) {
            const templateSystem = templates[item.type];
            // Initialize missing fields using the template
            for (const key in templateSystem) {
                if (item.system[key] === undefined) {
                    item.system[key] = templateSystem[key];
                }
            }
        }

        // Clean stats to make it "fresh" for the current system but keep folder structure
        item._stats = {
            systemId: "sra2",
            systemVersion: "13.2.1",
            coreVersion: "11.315",
            createdTime: Date.now(),
            modifiedTime: Date.now(),
            lastModifiedBy: "SRA2Enhancements"
        };
        
        fs.writeFileSync(path.join(tempSrc, path.basename(filePath)), JSON.stringify(item, null, 2), 'utf8');
    }

    // 3. Compile LevelDB 
    console.log("Compilation LevelDB du compendium intégré...");
    await compilePack(tempSrc, packDest, { yaml: false });

    // Cleanup
    fs.rmSync(tempSrc, { recursive: true, force: true });
    
    console.log(`\n======================================================`);
    console.log(`SUCCÈS: Le compendium pack/anarchy-objets a été regénéré.`);
    console.log(`======================================================`);
}

build().catch(e => { console.error(e); process.exit(1); });
