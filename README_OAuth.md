# oAuth

nastavení clientID,secretID config.oauth.json

## oAuth2 Google
account marcel.langr@gmail.com

https://console.cloud.google.com/apis/credentials

konfigurace authorised redirect URIs 
https://aistaging.azurewebsites.net/login/google/callback
https://aistaging-backend.onrender.com/login/google/callback
http://localhost:8080/login/google/callback

## oAuth2 Facebook
registrace na  Facebook Developer Portal - MyApp

Use Cases - Authentication and account creation - Customize - Settings

account marcel.langr@gmail.com
https://developers.facebook.com/

APP client ID      1131163831284781
APP secret         d53bf0bbf7998a1ad376139c8a3e1ce9

konfigurace authorised redirect URIs 
https://aistaging.azurewebsites.net/login/facebook/callback 
https://aistaging-backend.onrender.com/login/facebook/callback
https://localhost:8080/login/facebook/callback


## oAuth GITHUB - disabled na clientovi
https://github.com/settings/developers


## oAuth2 Microsoft - nepoužito

account tereza.langrova@unicoruniversity.net

Vyžaduje aktivní předplatné !!!! - momententálně nefunguje resp. nevaliduje cizí účty 
vytvořen nový tenant Azure AD B2C  (Active Directory B2C)
https://learn.microsoft.com/cs-cz/azure/active-directory-b2c/quickstart-create-tenant
https://learn.microsoft.com/cs-cz/azure/active-directory-b2c/tutorial-create-tenant?WT.mc_id=Portal-Microsoft_AAD_B2CAdmin

AzurePortal
registrace aplikace Microsoft Entra ID

clientID  3401ff27-0854-47cb-82ef-a64e721273e4
tenant ID 8e17fb86-8f7c-48ba-96d7-80a6d8c84b42
secret    PfF8Q~OxBUPK1i8PygzUUPjie1qO3CEACE9EpagC
secretID  bbde8d54-589e-4129-a838-ed2fc3e30016