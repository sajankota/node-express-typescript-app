// src/utils/reportGenerator.ts
import { exec } from 'child_process';

export const generateReportCommand = async (url: string, formFactor: 'mobile' | 'desktop'): Promise<any> => {
    const chromeFlags = [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-features=NetworkService,NetworkServiceInProcess',
    ].join(' ');

    const command = `npx lighthouse ${url} --${formFactor === 'mobile' ? 'emulated-form-factor=mobile' : 'preset=desktop'
        } --output=json --quiet --chrome-flags="${chromeFlags}"`;
    const maxBuffer = 20 * 1024 * 1024; // Increase buffer size to 20 MB

    return new Promise((resolve, reject) => {
        exec(command, { maxBuffer }, (error, stdout, stderr) => {
            if (error || stderr) {
                // Check for cycle detection error and retry with simplified analysis
                if (stderr.includes('cycle detected')) {
                    console.error('[Lighthouse Error] Cycle detected. Retrying with reduced checks.');
                    const retryCommand = `npx lighthouse ${url} --only-categories=performance --output=json --quiet --chrome-flags="${chromeFlags}"`;
                    exec(retryCommand, { maxBuffer }, (retryError, retryStdout, retryStderr) => {
                        if (retryError || retryStderr) {
                            reject(retryError || new Error(retryStderr));
                        } else {
                            try {
                                const parsedOutput = JSON.parse(retryStdout);
                                resolve(parsedOutput);
                            } catch (parseError) {
                                reject(new Error('Failed to parse Lighthouse output after retry.'));
                            }
                        }
                    });
                } else {
                    reject(error || new Error(stderr));
                }
            } else {
                try {
                    const parsedOutput = JSON.parse(stdout);
                    resolve(parsedOutput);
                } catch (parseError) {
                    reject(new Error('Failed to parse Lighthouse output.'));
                }
            }
        });
    });
};
