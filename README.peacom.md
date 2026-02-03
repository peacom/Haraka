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
Edit `tls.ini` to point to your ssl certificate
key=../ssl/rootCA.key
cert=../ssl/rootCA.pem

## Create name service
Create file `me` and add a name you want to that by default is `haraka`(not recommend)

### Step 3: Setup file systemd
Create `haraka-smtp.service` from `/etc/systemd/system/` 

```sh
cd /etc/systemd/system/
sudo touch haraka-smtp.service
```

Edit `haraka-smtp.service`
```sh
sudo vi haraka-smtp.service
```
Notes: According to `./haraka-smtp.service`, in `haraka-smtp.service` change name `ubuntu` by your server name

Start `haraka-smtp.service`
```sh
sudo systemctl daemon-reload
sudo systemctl restart haraka-smtp.service
sudo systemctl status haraka-smtp.service
```