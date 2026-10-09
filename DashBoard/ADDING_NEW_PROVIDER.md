# Adding a New Provider to Dashboard

This guide explains how to add a new OAuth provider (e.g., Spotify, Slack) and create widgets for it.

## Overview

A provider consists of:
1. **OAuth Adapter** — handles authentication and token refresh
2. **Widget Adapter** — fetches and transforms widget data
3. **Database seeding** — registers services and widget definitions
4. **Frontend integration** — adds a menu component

---

## Step 1: Create the OAuth Adapter

Create a new file in [`backend/src/adapters/extern/providers/`](./backend/src/adapters/extern/providers/) following the [example file](./backend/src/adapters/extern/providers/example-oaut.adapter.ts):


````typescript
//provider-oauth.adapter.ts
import { Injectable } from "@nestjs/common";
import { ProviderPort } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from "axios";

const PROVIDER_NAME = "provider";
const TOKEN_URL = "provider_token_endpoint";
const USER_URL = "provider_user_endpoint";

@Injectable()
export class [Provider]OauthAdapter implements ProviderPort {
    // API call to get the access token from provider
  }

  async refreshToken(token: string | null): Promise<Identity | null> {
    // API call to provider to refresh the access token
  }

  private async buildIdentity(
    accessToken: string,
    refreshToken: string | undefined,
    expiresIn: number | undefined
  ): Promise<Identity> {
    const { data: user } = await axios.get(USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return new Identity(
      PROVIDER_NAME,
      String(user.id),
      user.email ?? undefined,
      user.name ?? user.username ?? undefined,
      accessToken,
      refreshToken,
      expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined
    );
  }
}
````

---

## Step 2: Create Widget Data Types

Add your widget data types to `backend/src/domain/port/widget-data.provider.ts`:

````typescript

export interface ProviderItem {
  id: string
  title: string
  // ... other fields
}

export interface WidgetDataType {
  kind: '[provider]'
  items: [Provider]Item[]
}

// Update the WidgetData union to include your new type:
export type WidgetData =
  | WidgetDataList
  | WidgetDataPlaylists
  | WidgetDataType  // Add this
````

---

## Step 3: Create the Widget Adapter

Create a new file in [`backend/src/adapters/extern/providers/`](./backend/src/adapters/extern/providers/) following the [example file](./backend/src/adapters/extern/providers/example-widget.adapter.ts):

````typescript
// provider-widget.adapter.ts
import axios from 'axios'
import {
  WidgetDataError,
  type WidgetData,
  type WidgetDataProviderPort,
} from '../../../domain/port/widget-data.provider.js'

const API_BASE = 'https://api.[provider].com'

interface ProviderApiItem {
  id: string
  name: string
  url?: string
  // ... provider's actual response shape
}

export class ProviderWidgetAdapter implements WidgetDataProviderPort {
  async fetch(
    widgetSlug: string,
    config: Record<string, unknown>,
    accessToken: string
  ): Promise<WidgetData> {
    const limit = parseLimit(config.limit)

    try {
      switch (widgetSlug) {
        // add a case for each widget slug calling the corresponding private function
        // e.g : fetchItems(limit, accessToken)
        default:
          throw new WidgetDataError(
            `Unknown [Provider] widget "${widgetSlug}"`,
            'bad-config'
          )
      }
    } catch (error) {
      throw toWidgetDataError(error)
    }
  }


  private async fetchItems( limit: number, accessToken: string) : Promise<WidgetData> {
    // get data from provider API
  }
}

function providerHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  }
}

function toItem(item: [Provider]ApiItem): [Provider]Item {
  return {
    id: item.id,
    title: item.name,
    // ... map other fields
  }
}

function parseLimit(value: unknown): number {
  const limit = Number(value ?? 10)
  return Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 50) : 10
}

function toWidgetDataError(error: unknown): unknown {
  if (!axios.isAxiosError(error)) return error

  switch (error.response?.status) {
    case 401:
      return new WidgetDataError(
        'Provider rejected the token, reconnect your account',
        'not-connected'
      )
    case 404:
      return new WidgetDataError(
        'Resource not found or access denied',
        'bad-config'
      )
    default:
      return new WidgetDataError(
        'Could not reach the provider, try again later',
        'provider-failed'
      )
  }
}
````

---

## Step 4: Register Adapters in the Module

Edit `backend/src/adapters/entry/widget.module.ts`:

````typescript
// At the top, add the import:
import { ProviderWidgetAdapter } from '../extern/providers/[provider]-widget.adapter.js'

// Update the widgetDataProviders map:
const widgetDataProviders: WidgetDataProviders = {
  github: new GithubWidgetAdapter(),
  google: new GoogleWidgetAdapter(),
  discord: new DiscordWidgetAdapter(),
  providerSlug: new [Provider]WidgetAdapter(), // Add this
}
````

Also update `backend/src/adapters/entry/oauth.module.ts` and `backend/src/adapters/entry/provider.module.ts` if they use provider resolvers.

---

## Step 5: Add Provider Enum

Edit `backend/src/dto/oauth.dto.ts`:

````typescript
export enum ProviderEnum {
  GOOGLE = "google",
  GITHUB = "github",
  DISCORD = "discord",
  PROVIDER = "providerSlug", // Add this
}
````

---

## Step 6: Seed Widget Definitions

Edit `backend/prisma/seed.ts` and add at the end of the `main()` function:

````typescript
const [provider] = await prisma.service.upsert({
  where: { slug: '[provider]' },
  update: { 
    name: '[Provider Name]',
    description: '[Brief description of the service]'
  },
  create: { 
    slug: '[provider]',
    name: '[Provider Name]',
    description: '[Brief description]'
  },
})

await upsertWidgetDefinition([provider].id, {
  slug: 'items',
  name: '[Provider] Items',
  description: 'Display items from your [Provider] account',
  params: [
    { 
      key: 'limit', 
      label: 'Max results', 
      type: 'INTEGER', 
      defaultValue: '10' 
    },
  ],
})
````

Then run the seed:

```bash
cd DashBoard
npm run backend:seed
npm run backend:migrate
```

---

## Step 7: Add Environment Variables

Edit `backend/.env.example` and `backend/.env`:

```env
[PROVIDER]_CLIENT_ID=your_client_id_here
[PROVIDER]_CLIENT_SECRET=your_client_secret_here
[PROVIDER]_REDIRECT_URI=http://localhost:5173/oauth/callback
```

---

## Step 8: Create Frontend OAuth Helper

Create `frontend/src/oauth/[provider]Auth.tsx`:

````tsx
export function redirectTo[Provider]Oauth() {
  const state = btoa(JSON.stringify({
    provider: '[provider]',
    nonce: crypto.randomUUID(),
  }))

  sessionStorage.setItem('oauth_state', state)

  const scope = [
    'user-read-private',
    'user-read-email',
    // ... other scopes needed
  ].join(' ')

  const params = new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID', // From .env or hardcoded for dev
    redirect_uri: 'http://localhost:5173/oauth/callback',
    response_type: 'code',
    scope,
    state,
  })

  window.location.href = `https://[provider].com/oauth/authorize?${params}`
}
````

---

## Step 9: Create Frontend Menu Component

Create `frontend/src/components/[Provider]Menu.tsx`:

````tsx
import { redirectTo[Provider]Oauth } from '../oauth/[provider]Auth'
import { fetchWidgetDefinitions } from '../dashboard/api'
import type { WidgetDefinition } from '../dashboard/types'
import ProviderMenu from './ProviderMenu'

interface [Provider]MenuProps {
  onAddWidget?: (
    definition: WidgetDefinition,
    config: Record<string, string | number | boolean>,
    refreshRateSeconds: number,
  ) => Promise<void>
}

function [Provider]Mark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      {/* SVG icon here */}
    </svg>
  )
}

function [Provider]Menu({ onAddWidget }: [Provider]MenuProps) {
  return (
    <ProviderMenu
      label="[Provider] integration"
      triggerLabel="Connect with [Provider]"
      fetchDefinitions={() => fetchWidgetDefinitions('[provider]')}
      onConnect={redirectTo[Provider]Oauth}
      renderTriggerIcon={[Provider]Mark}
      onAddWidget={onAddWidget}
    />
  )
}

export default [Provider]Menu
````

---

## Step 10: Add Menu to Dashboard

Edit `frontend/src/dashboard/Dashboard.tsx`:

````tsx
// Near the top:
import [Provider]Menu from '../components/[Provider]Menu'

// In the Dashboard component's JSX (in the NavBar):
<NavBar brandTo="/dashboard">
  <GithubMenu onAddWidget={handleAddWidget} />
  <GoogleMenu onAddWidget={handleAddWidget} />
  <DiscordMenu onAddWidget={handleAddWidget} />
  <[Provider]Menu onAddWidget={handleAddWidget} /> {/* Add this */}
  <ThemeButton/>
  <button type="button" onClick={handleLogout}>Log out</button>
</NavBar>
````

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unknown provider" error | Check that provider is added to `ProviderEnum` in `oauth.dto.ts` |
| Widget doesn't appear | Verify widget definition is seeded: `npx prisma studio` |
| OAuth fails | Check env vars match provider's registered redirect URI |
| Token refresh fails | Verify `refreshToken()` correctly handles the provider's response format |
| Widget data is empty | Check API response shape matches your adapter's type casting |

---

## Key Differences Between Providers

### Accept Header  
Some providers want different response formats:
- **GitHub, Spotify, Discord**: `Accept: "application/json"`
- **Google**: May need `Content-Type: "application/x-www-form-urlencoded"`
- Always check the provider's OAuth documentation

### Request Body Format
- **Form-encoded** (most common): Use `new URLSearchParams({...})`
- **JSON**: Use `JSON.stringify({...})`

### Scopes
Each provider has different scope requirements:
```typescript
// Example scope lists
const githubScopes = ['repo', 'user:email']
const spotifyScopes = ['user-read-private', 'user-read-email']
const discordScopes = ['identify', 'email']
```

---

## References

- Example OAuth adapter: `backend/src/adapters/extern/providers/example-oauth.adapter.ts`
- Example Widget adapter: `backend/src/adapters/extern/providers/example-widget.adapter.ts`
- Widget data types: `backend/src/domain/port/widget-data.provider.ts`
- Provider enum: `backend/src/dto/oauth.dto.ts`

