// src/utils/reportGenerator.ts
import { exec } from 'child_process';

export const generateReportCommand = async (url: string, formFactor: 'mobile' | 'desktop'): Promise<any> => {
    const command = `npx lighthouse ${url} --${formFactor === 'mobile' ? 'emulated-form-factor=mobile' : 'preset=desktop'
        } --output=json --quiet --chrome-flags="--headless --no-sandbox --disable-gpu"`;
    const maxBuffer = 10 * 1024 * 1024; // 10 MB

    return new Promise((resolve, reject) => {
        exec(command, { maxBuffer }, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error || new Error(stderr));
            } else {
                try {
                    const parsedOutput = JSON.parse(stdout);
                    resolve(parsedOutput);
                } catch (parseError) {
                    reject(new Error('Failed to parse Lighthouse output'));
                }
            }
        });
    });
};
