#!/usr/bin/env bash

# A heavy-handed approach to redacting what could potentially be sensitive information in a Terraform output stream

sed -E 's/[A-Za-z0-9/\+=]{40}/<redacted>/g
        s/[0-9a-f]{4,}-[0-9a-f]{4,}-[0-9a-f]{4,}-[0-9a-f]{4,}-[0-9a-f]{4,}/<redacted>/g
        s/[A-Z0-9]{7,}/<redacted>/g
        s/[0-9]{7,}/<redacted>/g'
