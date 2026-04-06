import { compilePack } from '@foundryvtt/foundryvtt-cli';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function build() {
    const desktop = execSync('powershell "[Environment]::GetFolderPath(\'Desktop\')"').toString().trim();
    const sysRef = path.resolve('.sra2-system-ref');
    const tempSrc = path.resolve('_temp_src_arsenal');
    
    // NEW module ID to bypass any corrupted Forge cache!
    const modId = 'sr-anarchy-objets-v2';
    const tempMod = path.join(desktop, modId);
    const zipPath = path.join(desktop, 'SR_Anarchy_Objets.zip');

    // Clean
    [tempSrc, tempMod].forEach(d => { if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); });
    fs.mkdirSync(tempSrc, { recursive: true });

    // Extract 611 JSONs from git
    const fileList = execSync(`git -C "${sysRef}" ls-tree --name-only "797813f^" src/packs/anarchy-objets/`)
        .toString().trim().split('\n').filter(Boolean);
    
    console.log(`Extraction de ${fileList.length} fichiers...`);
    for (const filePath of fileList) {
        const content = execSync(`git -C "${sysRef}" show "797813f^:${filePath}"`, { encoding: 'utf8' });
        fs.writeFileSync(path.join(tempSrc, path.basename(filePath)), content, 'utf8');
    }

    // Compile 
    // NEW compendium name to reset Foundry's internal collections
    const packDest = path.join(tempMod, 'packs', 'objets-anarchy');
    fs.mkdirSync(packDest, { recursive: true });
    console.log("Compilation LevelDB du nouveau compendium...");
    await compilePack(tempSrc, packDest, { yaml: false });

    // Write module.json with new identities 
    const modJson = {
        id: modId,
        title: "SR Anarchy objets",
        description: "Compendium des 611 objets (Nouvelle base propre)",
        version: "1.0.0",
        compatibility: { minimum: "11", verified: "13.2.1" },
        packs: [{
            name: "objets-anarchy",
            label: "SR Anarchy objets",
            path: "packs/objets-anarchy",
            type: "Item",
            system: "sra2",
            ownership: {
                PLAYER: "OBSERVER",
                ASSISTANT: "OWNER"
            }
        }]
    };
    fs.writeFileSync(path.join(tempMod, 'module.json'), JSON.stringify(modJson, null, 2), 'utf8');

    // ZIP
    if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
    console.log("Création du ZIP...");
    execSync(`powershell "Compress-Archive -Path '${tempMod}\\*' -DestinationPath '${zipPath}' -Force"`);

    // Cleanup
    fs.rmSync(tempSrc, { recursive: true, force: true });
    fs.rmSync(tempMod, { recursive: true, force: true });
    
    console.log(`\n======================================================`);
    console.log(`SUCCÈS: Le module est prêt sur ton Bureau`);
    console.log(`Fichier : ${zipPath}`);
    console.log(`======================================================`);
}

build().catch(e => { console.error(e); process.exit(1); });
