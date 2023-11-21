import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'node:fs'

class Tokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  tokens: Tokens

  constructor() {
    const tokens = JSON.parse(readFileSync('tokens.json').toString())
    if (!tokens) throw new Error('Не удалось распарсить токены')
    this.tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    }
    console.log(this.tokens)
  }

  private get() {
    console.log('RETURN:', 'Bearer ' + this.tokens.accessToken)
    return 'Bearer ' + this.tokens.accessToken
  }

  private async refresh() {
    const response = await fetch(process.env.DOMAIN + '/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
        redirect_uri: process.env.REDIRECT_URI,
      }),
    })
    const data = await response.json()
    console.log('TOKENS UPDATED. RECEIVED:', data)
    if (response.status != 200) throw new Error(data)
    this.tokens.accessToken = data.access_token
    this.tokens.refreshToken = data.refresh_token
    writeFileSync(
      'tokens.json',
      JSON.stringify({
        access_token: this.tokens.accessToken,
        refresh_token: this.tokens.refreshToken,
      }),
    )
  }

  async fetchWithAuth(
    route: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    headers: any,
    body: any,
  ) {
    const callApi = async () =>
      await fetch(process.env.DOMAIN + route, {
        method,
        headers: {
          ...headers,
          Authorization: this.get(),
        },
        body: JSON.stringify(body),
      })

    let response = await callApi()
    if (response.status === 401) {
      await this.refresh()
      response = await callApi()
      if (response.status === 401) throw new Error('Не удалось обновить токены')
    }
    return await response.json()
  }
}
