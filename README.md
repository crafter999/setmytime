# syncmytime

Ultra accurate system date Synchronization using multiple NTP public servers for Unix machines. 
The server part is written in Typescript (Node.js) and the "date setting" part in C using the
system call `clock_settime`. This project has 0 dependencies.

# Install

Make sure node-gyp is installed
```bash
apt-get install build-essential
npm install -g node-gyp
```

Install package as root
```bash
npm install -g syncmytime # --unsafe
```

# Run as root

Unless `-s <host` argument is provided, running just `syncmytime` will fetch & set time from one of the following servers based on lowest latency: 
```
pool.ntp.org
europe.pool.ntp.org
time.cloudflare.com
0.arch.pool.ntp.org
0.debian.pool.ntp.org
time.apple.com
ntp1.net.berkeley.edu
ntp1.hetzner.de
0.android.pool.ntp.or
```
Setting env `SYNCMYTIMEDEBUG=true` will enable logging.

# Example
