import * as path from "path";
import * as fs from "fs";

export const getFilesRecursive = (p: string) => {
    if (!fs.existsSync(p)) return;

    const files = [];

    for (const file of fs.readdirSync(p)) {
        const fullPath = path.join(p, file);
        if (fs.lstatSync(fullPath).isDirectory())
            getFilesRecursive(fullPath).forEach((x) =>
                files.push(path.join(file, x)),
            );
        else files.push(file);
    }
    return files;
};
