# Decentralised-social-recovery
[![GitHub release](https://img.shields.io/github/release/pxsocs/warden.svg)](https://github.com/yogendra-17/specterext-warden/releases/tag/Specterext-warden)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://GitHub.com/pxsocs/warden/releases/)

## Requirements:

> [npm v1.12.0](https://docs.npmjs.com/cli/v8/commands/npm-version/)

>[yarn v1.22.19](https://yarnpkg.com/)

## P2P social recovery system for secure backup/recovery of your secrets.

![t,n threshold policy](https://user-images.githubusercontent.com/54116506/205468692-3eb351a7-051a-4364-ac3b-ab70ced90bc6.png)

An end-to-end application that shards your private key/secrets into multiple parts and sends it across to trusted human social accounts. 
Salient features include:

- Collusion resistance: This ensures that the shard-recievers (Guardians) don't generate user's private key without the permission/knowledge of the users.
- Implementation of modified Shamir secret algorithm(n,t): Shamir Secret algorithm forms the core of our system's logic.
- Providing a secure backup option as there is no single point of failure: Storing a private key in a single place, makes it very vulnerable to attacks. Sharding a private key and storing it in multiple places is a much more secure way to backup. 
- Collusion resistance: This ensures that the shard-recievers (Guardians) don't generate user's private key without the permission/knowledge of the users.
- Implementation of modified Shamir secret algorithm(n,t): Shamir Secret algorithm forms the core of our system's logic.
- Providing a secure backup option as there is no single point of failure: Storing a private key in a single place, makes it very vulnerable to attacks. Sharding a private key and storing it in multiple places is a much more secure way to backup. 

![t,n thresholdrecovery](https://user-images.githubusercontent.com/54116506/205468848-5636b8b6-34a8-4637-92a0-5901c525e511.png)


# INSTALLATION

```bash

1. npm install
2. cd ios
3. install pod
4. cd ..
5. npm run android

```

## Use-case:-
The authenticator apps currently in the market do not allow the user to reclaim the accounts if their account/phone/application is lost. Our authenticator app makes it possible to securely reclaim a 2fa-enabled account / Keys if the user loses their phone.
Share the account secrets among the user’s friends/family

## The UX flow is:

- The user will enter the email addrs of the peers with which it wants to share the shard, and contact each one of them to approve the request.

- Once the user approves the requests, it's done.

- For Recovery (Upon data loss), the user can send recollect requests (hints of the peers are written in the SLDealer file) to the peers to get their share back.

- Once all the peers give the appropriate share back, the user can click on "Recover Key" to get all the accounts back!

## Challenges:

- Implementing Shamir's secret(collusion resistant) in JS.
- Extending (2,3) Sharding algorithm to (n,t).
- Improving Web 2.0 applications using Web 3.0 Technologies.
- Implementing Decentralise Peer to Peer communication.
- Integrating metamask in react native.
- Integrating Push Protocol(P2P secure decentralise communication

## ScreenShots:

![APP front](https://user-images.githubusercontent.com/54116506/205469985-2d8d8258-fc2a-4a4e-b163-ad62f33e1a19.JPG)


![app guard](https://user-images.githubusercontent.com/54116506/205470007-99ea9324-fe3a-4730-a2e7-5eed8a3b9388.JPG)


