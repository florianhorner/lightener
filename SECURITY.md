# Security Policy

## Supported Versions

Only the latest release is supported with security updates.

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |
| Older   | No        |

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report vulnerabilities through
[GitHub Security Advisories](https://github.com/florianhorner/lightener-curve-editor/security/advisories/new).

You can expect an initial response within 7 days. If the issue is confirmed,
a fix will be released as soon as practical.

## Scope

This is a Home Assistant custom integration that runs on the local network.
The primary attack surface is limited to authenticated Home Assistant users
with access to the WebSocket API. Write operations (saving curves) require
Home Assistant admin privileges.
