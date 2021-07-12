{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: INGRESS_URL
    value: "https://{{ .Values.ingress.host }}"

  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_ID

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_SECRET

  - name: SYSTEM_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SYSTEM_CLIENT_ID

  - name: SYSTEM_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SYSTEM_CLIENT_SECRET

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: APPINSIGHTS_INSTRUMENTATIONKEY

  - name: SESSION_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SESSION_SECRET

  - name: REDIS_HOST
    valueFrom:
      secretKeyRef:
        name: hmpps-manage-supervisions-elasticache-redis
        key: primary_endpoint_address

  - name: REDIS_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: hmpps-manage-supervisions-elasticache-redis
        key: auth_token

  - name: REDIS_TLS_ENABLED
    value: {{ .Values.env.REDIS_TLS_ENABLED }}
    value: "true"

  - name: HMPPS_AUTH_URL
    value: {{ .Values.env.HMPPS_AUTH_URL | quote }}

  - name: TOKEN_VERIFICATION_API_URL
    value: {{ .Values.env.TOKEN_VERIFICATION_API_URL | quote }}

  - name: TOKEN_VERIFICATION_ENABLED
    value: {{ .Values.env.TOKEN_VERIFICATION_ENABLED | quote }}

  - name: COMMUNITY_API_URL
    value: {{ .Values.env.COMMUNITY_API_URL | quote }}

  - name: ASSESS_RISKS_AND_NEEDS_API_URL
    value: {{ .Values.env.ASSESS_RISKS_AND_NEEDS_API_URL | quote }}

  - name: NODE_ENV
    value: production

{{- end -}}
