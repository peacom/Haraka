### Step 1: Install Packages with yarn

```sh
yarn
```

### Step 2: Config Plugins (./config)

Default configurations

## Auth

Create `auth_flat_file.ini` according to template `auth_flat_file.ini.example`

## SMTP Forward

Create `smtp_forward.ini` according to template `smtp_forward.ini.example`

## System

Create `system_config.ini` according to template `system_config.ini.example`

## TLS
```sh
mkdir -p /usr/projects/temp/Haraka/ssl
```

```sh
openssl req -x509 -newkey rsa:4096 -nodes -days 365 -keyout "/usr/projects/temp/Haraka/ssl/rootCA.key" -out "/usr/projects/temp/Haraka/ssl/rootCA.pem"
```

## Create name service (optional)

Create file `me` and add a email server name(recommend)

```sh
echo email-server >> /usr/projects/temp/Haraka/config/me
```

### Step 3: Setup file systemd

Create `haraka-smtp.service` from `/etc/systemd/system/`

```sh
sudo vi /etc/systemd/system/haraka.service
```

```sh
[Unit]
Description=Haraka SMTP
After=network.target

[Service]
User=root
WorkingDirectory=/usr/projects/temp/Haraka
LogsDirectory=haraka
ExecStart=/home/ubuntu/.nvm/versions/node/v24.16.0/bin/node haraka.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/haraka/app.log
StandardError=append:/var/log/haraka/app-error.log

[Install]
WantedBy=multi-user.target
```

Start `haraka.service`

```sh
sudo systemctl daemon-reload
sudo systemctl enable haraka.service --now
sudo systemctl status haraka.service
```

### Step 4: Setup logrotate
```sh
sudo vi /etc/logrotate.d/haraka
```

```sh
/var/log/haraka/*.log {
    daily
    rotate 14
    missingok
    compress
    delaycompress
    notifempty
    create 640 root root
    sharedscripts
    postrotate
        systemctl reload haraka.service 2>/dev/null || systemctl restart haraka.service 2>/dev/null || true
    endscript
}
```