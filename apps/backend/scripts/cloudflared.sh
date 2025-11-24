CLOUDFLARED_TOKEN=$(doppler secrets get CLOUDFLARED_TOKEN --plain)

sudo cloudflared service install $CLOUDFLARED_TOKEN
