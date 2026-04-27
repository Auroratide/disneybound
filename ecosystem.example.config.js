module.exports = {                                        
	apps: [{
		name: "nextjs",
		script: "pnpm",
		args: "start",
		env: {
			PB_SUPERUSER_EMAIL: "admin@disneybounding.com",
			PB_SUPERUSER_PASSWORD: "password",
			NEXT_PUBLIC_POCKETBASE_URL: "http://127.0.0.1:8090",
		}
	}]
}
