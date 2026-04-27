# VPS Setup

If you get a new VPS, do this:

1. Open it, then run this script: `./setup.sh`. This script only ever needs to be run once.
2. Create a SSH key so github CI can connect to the VPS. Remember to set it as an authorized key. `cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys`
3. Add the following to `~/.ssh/config`:
```
Host github.com
      IdentityFile ~/.ssh/deploy_key
      IdentitiesOnly yes
```
4. Clone the project into `/srv/disneybounding`.


## SMTP Server

The SMTP server is set up via the pocketbase admin portal. I am currently using Brevo.

1. Access the Admin Portal.
2. Go to Settings, and set up the application name.
3. Set up the SMTP server using the info found in Brevo (Transactional -> Email)

## Admin Portal

To access the admin portal, you need to open an SSH tunnel.

```
ssh -L 8090:localhost:8090 root@disneybounding.com
```

Then go to http://localhost:8090/_/

This keeps all of pocketbase behind the firewall.