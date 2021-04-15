import { exec } from "child_process";

export function execute(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 65535 }, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        if (stderr !== "") {
          reject(stderr)
        }
        resolve(stdout)
      });
    });
  }