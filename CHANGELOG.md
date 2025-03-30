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
