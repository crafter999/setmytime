export function logger(section: string, message: string): void {
    if (process.env.SYNCMYTIMEDEBUG) {
        if (section === "") {
            console.log(`${message}`)
        } else {
            console.log(`${section}: ${message}`)
        }
    }
}
