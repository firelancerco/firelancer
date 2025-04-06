## <small>1.2.1 (2025-04-06)</small>


#### Fixes

*
    **core**
change timestamp columns from 'timestamptz' to 'timestamp' type across multiple entities([3a99034](https://github.com/firelancerco/firelancer    /commit/3a99034))
## 1.2.0 (2025-04-05)


#### Features

*
    **core**
enhance job post management by introducing a state machine for transitions, updating job post schema to include new states, and refining job post service methods for better state handling and validation([7c9075f](https://github.com/firelancerco/firelancer    /commit/7c9075f))
## <small>1.1.10 (2025-04-04)</small>


#### Features

*
    **core**
add PaginatedList class and update JobPost schema to enforce visibility and budget fields; refactor job post service to handle new visibility logic and ensure non-null constraints([c3852e5](https://github.com/firelancerco/firelancer    /commit/c3852e5))
## <small>1.1.9 (2025-04-04)</small>


#### Features

*
    **core**
update job post input schema to include required fields and adjust skill constraints; refactor job post service to handle new input structure([e4ef8f6](https://github.com/firelancerco/firelancer    /commit/e4ef8f6))*
    **core**
update shared-schema to enhance user and customer models; remove title field and add validation for email and phone number([eea0d84](https://github.com/firelancerco/firelancer    /commit/eea0d84))
#### Fixes

*
    **core**
reorder exports in cache index to ensure proper module resolution([b707ee9](https://github.com/firelancerco/firelancer    /commit/b707ee9))
## <small>1.1.8 (2025-04-03)</small>


#### Features

*
    **core**
enhance FacetValueController to accept query options for fetching facet values by ID and code; refactor balance entry and job post status calculations for improved readability([4ebb682](https://github.com/firelancerco/firelancer    /commit/4ebb682))
## <small>1.1.7 (2025-04-03)</small>


#### Features

*
    **common**
update shared-schema([043b589](https://github.com/firelancerco/firelancer    /commit/043b589))*
    **core**
add FacetValueController and integrate it into the entityControllers; refactor FacetController methods for consistency([7a742ee](https://github.com/firelancerco/firelancer    /commit/7a742ee))*
    **core**
enhance job post entity with closedAt field, update job post status logic, and introduce entity hydration for improved data handling([b0a3f9d](https://github.com/firelancerco/firelancer    /commit/b0a3f9d))*
    **core**
implement validation for required experience level, job duration, and job scope in job post service([7931b46](https://github.com/firelancerco/firelancer    /commit/7931b46))*
    **core**
refactor job post sorting parameters to use enum for closedAt and publishedAt fields, and enhance job post status calculation logic([ab3911f](https://github.com/firelancerco/firelancer    /commit/ab3911f))
## <small>1.1.6 (2025-04-02)</small>


#### Features

*
    **common**
add job post, balance entry inputs with optional fields and search functionality([95746ed](https://github.com/firelancerco/firelancer    /commit/95746ed))
## <small>1.1.5 (2025-04-02)</small>


#### Fixes

*
    **core**
add cacheStrategy to ConfigModule([4548226](https://github.com/firelancerco/firelancer    /commit/4548226))
#### Features

*
    **core**
implement caching mechanism with CacheService, CacheStrategy, and DefaultCachePlugin for improved performance([5e76f35](https://github.com/firelancerco/firelancer    /commit/5e76f35))
## <small>1.1.4 (2025-03-31)</small>


#### Features

*
    **core**
introduce AssetController and enhance job post schemas with asset and facet validation([e112b49](https://github.com/firelancerco/firelancer    /commit/e112b49))
## <small>1.1.3 (2025-03-30)</small>


#### Features

*
    **core**
add validation and transformation for assetIds and facetValueIds in job post schemas([23649f8](https://github.com/firelancerco/firelancer    /commit/23649f8))*
    **core**
enhance collection and job post management with new endpoints and validation improvements([38f45c1](https://github.com/firelancerco/firelancer    /commit/38f45c1))
## <small>1.1.2 (2025-03-30)</small>


#### Features

*
    **core**
add publishedAt filter parameter to JobPostFilterParameter schema([3cea834](https://github.com/firelancerco/firelancer    /commit/3cea834))*
    **core**
introduce configurable operations and enhance collection management with new schemas and services([8cd9708](https://github.com/firelancerco/firelancer    /commit/8cd9708))
## <small>1.1.1 (2025-03-29)</small>


#### Features

*
    **core**
enhance validation and error handling across controllers and schemas([7e717ee](https://github.com/firelancerco/firelancer    /commit/7e717ee))
## 1.1.0 (2025-03-29)


#### Fixes

*
    **core**
fix bug where totalItems is not used([30fd60b](https://github.com/firelancerco/firelancer    /commit/30fd60b))
#### Features

*
    **core**
add filtering and sorting capabilities for job posts and facets with new operators and options([d3286a2](https://github.com/firelancerco/firelancer    /commit/d3286a2))
## <small>1.0.15 (2025-03-29)</small>


#### Features

*
    **core**
add created-at timestamps fields for different authentication-method tokens([848b710](https://github.com/firelancerco/firelancer    /commit/848b710))*
    **core**
add JobPostController and refactor job post handling in services([a6c6c79](https://github.com/firelancerco/firelancer    /commit/a6c6c79))*
    **core**
change throttling limits for authentication endpoints([818c792](https://github.com/firelancerco/firelancer    /commit/818c792))*
    **core**
force throw email-address-conflict exception on customer registeration([fcf4689](https://github.com/firelancerco/firelancer    /commit/fcf4689))*
    **core**
integrate throttling and enhance exception handling in API([47abb65](https://github.com/firelancerco/firelancer    /commit/47abb65))*
    **core**
simplify InvalidCredentialsException handling and improve error messaging([60fe1b6](https://github.com/firelancerco/firelancer    /commit/60fe1b6))*
    **core**
update facet definitions and initial data structure for multilingual support([c78309e](https://github.com/firelancerco/firelancer    /commit/c78309e))*
    **core**
update job post schema and entity to support new fields and nullable properties([88f1984](https://github.com/firelancerco/firelancer    /commit/88f1984))*
    **email-plugin**
add initial implementation of email plugin with templates and event handling([5303017](https://github.com/firelancerco/firelancer    /commit/5303017))*
    **google-auth-plugin**
add Google authentication plugin with strategy and configuration([8e8fa91](https://github.com/firelancerco/firelancer    /commit/8e8fa91))*
    **google-auth-plugin**
enhance user registration and login handling with action-based flow([f8a3a48](https://github.com/firelancerco/firelancer    /commit/f8a3a48))*
    **google-auth-plugin**
improve error handling and messaging([5007af2](https://github.com/firelancerco/firelancer    /commit/5007af2))*
    **google-auth-plugin**
integrate authentication using OAuth 2.0([485e936](https://github.com/firelancerco/firelancer    /commit/485e936))
#### Fixes

*
    **core**
correct error message keys for email address and password reset token exceptions([d020ec4](https://github.com/firelancerco/firelancer    /commit/d020ec4))*
    **core**
enhance exception handling and improve error response structure([d6c3a6c](https://github.com/firelancerco/firelancer    /commit/d6c3a6c))*
    **core**
enhance language code retrieval in request context service([f3d66c6](https://github.com/firelancerco/firelancer    /commit/f3d66c6))*
    **core**
fix bug where passwordHash is not returned with authentication-method([eb9f912](https://github.com/firelancerco/firelancer    /commit/eb9f912))*
    **core**
fix shared-types type definitions([30822e4](https://github.com/firelancerco/firelancer    /commit/30822e4))*
    **core**
increase verification token duration to 2 minutes and revert to previous token generation logic([a12e2ef](https://github.com/firelancerco/firelancer    /commit/a12e2ef))*
    **core**
reduce session duration to 15 days and verification token duration to 30 seconds([cc159b5](https://github.com/firelancerco/firelancer    /commit/cc159b5))*
    **core**
update password validation strategy to require a minimum length of 8([33d18dd](https://github.com/firelancerco/firelancer    /commit/33d18dd))
## <small>1.0.14 (2025-03-27)</small>


#### Features

*
    **core**
change throttling limits for authentication endpoints([818c792](https://github.com/firelancerco/firelancer    /commit/818c792))*
    **core**
force throw email-address-conflict exception on customer registeration([fcf4689](https://github.com/firelancerco/firelancer    /commit/fcf4689))*
    **core**
simplify InvalidCredentialsException handling and improve error messaging([60fe1b6](https://github.com/firelancerco/firelancer    /commit/60fe1b6))*
    **google-auth-plugin**
enhance user registration and login handling with action-based flow([f8a3a48](https://github.com/firelancerco/firelancer    /commit/f8a3a48))
## <small>1.0.13 (2025-03-27)</small>


#### Features

*
    **core**
update facet definitions and initial data structure for multilingual support([c78309e](https://github.com/firelancerco/firelancer    /commit/c78309e))
## <small>1.0.12 (2025-03-27)</small>


#### Fixes

*
    **core**
fix shared-types type definitions([30822e4](https://github.com/firelancerco/firelancer    /commit/30822e4))
#### Features

*
    **core**
add JobPostController and refactor job post handling in services([a6c6c79](https://github.com/firelancerco/firelancer    /commit/a6c6c79))*
    **core**
update job post schema and entity to support new fields and nullable properties([88f1984](https://github.com/firelancerco/firelancer    /commit/88f1984))
## <small>1.0.11 (2025-03-24)</small>


#### Fixes

*
    **core**
correct error message keys for email address and password reset token exceptions([d020ec4](https://github.com/firelancerco/firelancer    /commit/d020ec4))*
    **core**
enhance exception handling and improve error response structure([d6c3a6c](https://github.com/firelancerco/firelancer    /commit/d6c3a6c))*
    **core**
enhance language code retrieval in request context service([f3d66c6](https://github.com/firelancerco/firelancer    /commit/f3d66c6))*
    **core**
fix bug where passwordHash is not returned with authentication-method([eb9f912](https://github.com/firelancerco/firelancer    /commit/eb9f912))*
    **core**
increase verification token duration to 2 minutes and revert to previous token generation logic([a12e2ef](https://github.com/firelancerco/firelancer    /commit/a12e2ef))*
    **core**
reduce session duration to 15 days and verification token duration to 30 seconds([cc159b5](https://github.com/firelancerco/firelancer    /commit/cc159b5))*
    **core**
update password validation strategy to require a minimum length of 8([33d18dd](https://github.com/firelancerco/firelancer    /commit/33d18dd))
#### Features

*
    **core**
add created-at timestamps fields for different authentication-method tokens([848b710](https://github.com/firelancerco/firelancer    /commit/848b710))*
    **core**
integrate throttling and enhance exception handling in API([47abb65](https://github.com/firelancerco/firelancer    /commit/47abb65))*
    **email-plugin**
add initial implementation of email plugin with templates and event handling([5303017](https://github.com/firelancerco/firelancer    /commit/5303017))*
    **google-auth-plugin**
add Google authentication plugin with strategy and configuration([8e8fa91](https://github.com/firelancerco/firelancer    /commit/8e8fa91))*
    **google-auth-plugin**
integrate authentication using OAuth 2.0([485e936](https://github.com/firelancerco/firelancer    /commit/485e936))
## <small>1.0.10 (2025-03-23)</small>


#### Fixes

*
    **core**
fix bug where passwordHash is not returned with authentication-method([eb9f912](https://github.com/firelancerco/firelancer    /commit/eb9f912))
## <small>1.0.9 (2025-03-23)</small>


#### Features

*
    **core**
add created-at timestamps fields for different authentication-method tokens([848b710](https://github.com/firelancerco/firelancer    /commit/848b710))*
    **core**
integrate throttling and enhance exception handling in API([47abb65](https://github.com/firelancerco/firelancer    /commit/47abb65))
#### Fixes

*
    **core**
enhance exception handling and improve error response structure([d6c3a6c](https://github.com/firelancerco/firelancer    /commit/d6c3a6c))
## <small>1.0.8 (2025-03-22)</small>


#### Features

*
    **google-auth-plugin**
integrate authentication using OAuth 2.0([485e936](https://github.com/firelancerco/firelancer    /commit/485e936))
#### Fixes

*
    **core**
increase verification token duration to 2 minutes and revert to previous token generation logic([a12e2ef](https://github.com/firelancerco/firelancer    /commit/a12e2ef))
## <small>1.0.7 (2025-03-21)</small>


#### Features

*
    **email-plugin**
add initial implementation of email plugin with templates and event handling([5303017](https://github.com/firelancerco/firelancer    /commit/5303017))
## <small>1.0.6 (2025-03-21)</small>


#### Fixes

*
    **core**
reduce session duration to 15 days and verification token duration to 30 seconds([cc159b5](https://github.com/firelancerco/firelancer    /commit/cc159b5))
## <small>1.0.5 (2025-03-21)</small>


#### Fixes

*
    **core**
update password validation strategy to require a minimum length of 8([33d18dd](https://github.com/firelancerco/firelancer    /commit/33d18dd))
#### Features

*
    **google-auth-plugin**
add Google authentication plugin with strategy and configuration([8e8fa91](https://github.com/firelancerco/firelancer    /commit/8e8fa91))
## <small>1.0.4 (2025-03-20)</small>


#### Fixes

*
    **core**
correct error message keys for email address and password reset token exceptions([d020ec4](https://github.com/firelancerco/firelancer    /commit/d020ec4))*
    **core**
enhance language code retrieval in request context service([f3d66c6](https://github.com/firelancerco/firelancer    /commit/f3d66c6))
## <small>1.0.3 (2025-03-20)</small>


## <small>1.0.2 (2025-03-20)</small>


## <small>1.0.1 (2025-03-19)</small>


## 1.0.0 (2025-03-18)

Firelancer v1.0 is here! 🎉
