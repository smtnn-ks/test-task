import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'node:fs'

class Tokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  private tokens: Tokens

  constructor() {
    const tokens = JSON.parse(readFileSync('tokens.json').toString())
    if (!tokens) throw new Error('Не удалось распарсить токены')
    this.tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    }
  }

  private get() {
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
    console.log('TOKENS UPDATED')
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
    body?: any,
  ) {
    console.log('ROUTE:', process.env.DOMAIN + route)
    const callApi = async () =>
      await fetch(process.env.DOMAIN + route, {
        method,
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: this.get(),
        }),
        body: JSON.stringify(body),
      })

    let response = await callApi()
    if (response.status === 401) {
      await this.refresh()
      response = await callApi()
      if (response.status === 401) throw new Error('Не удалось обновить токены')
    }
    return response
  }
}
