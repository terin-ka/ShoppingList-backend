# deploy on Render.com
účet na render.com napojený na Github MLangr

ovládání přes render dashboard
projekt AIStaging
obsahuje 4 services
AIStaging-backend - typ WebService
AIStaging-dashboard - typ Static site
AIStaging-client - typ Static site
postgres-aistaging - PostgreSQL databáze


https://docs.render.com/deploys

probíhá automatický Git deploy tj. při commitu do repository se vyvolá nový deploy
automatickému deploy se dá zabránit uvedením skip fráze do názvu commitu
The skip phrase is one of [skip render] or [render skip]
vypadá to např. takto
git commit -m "[skip render] Update README"

backend web service obsahuje tzv. health check endpoint
Render sends an HTTP request to this endpoint as part of zero-downtime deploys, and also every few seconds to verify the health of running services.