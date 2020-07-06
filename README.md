# AWS Budget Killswitch
Disable AWS services when budget is exceeded.  
This project allows to create an AWS Budget and a Lambda which will disable services in an emergency - when a predefined budget limit is exceeded.  
This is to prevent unexpected charges when your services are under DDoS attack or just the traffic is much higher than what you expected.  
It's unadvisable to use it in production - it's more for personal accounts.  
Better use something like AWS WAF for production.    

## How does it work?
A budget is created in AWS and upon reaching 99% it will send an email notification and will disable:  
1. Cloudfront distributions
2. Will set throttling to 0 on all methods of Api Gateway

It's a very blunt tool and designed to stop charges from external traffic.  

## Deployment
1. Install AWS SAM: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
2. Run:  

```bash
sam deploy -g
```
This will start a command-line wizard where you'd have to specify region, email and an emergency budget limit
Settings will be saved into `samconfig.toml`  

Next deployments can be done with  

```bash
sam deploy
```