import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { AuthService } from './auth/auth.service'

@Injectable()
export class AppService {
  constructor(private readonly authService: AuthService) {}

  async find(email?: string, phone?: string): Promise<number> {
    const query = ((email ? email + ' ' : '') + (phone ? phone : '')).trim()
    console.log('QUERY:', query)
    const route =
      '/api/v4/contacts' + (query && '?' + new URLSearchParams({ query }))
    const response = await this.authService.fetchWithAuth(route, 'GET')
    if (response.status == 204) return 0
    const data = await response.json()
    if (data._embedded.contacts.length > 1)
      throw new BadRequestException(
        'Нашлось более одного пользователя по такому запросу',
      )
    return data._embedded.contacts[0].id
  }

  async create(name: string, email: string, phone: string): Promise<number> {
    const response = await this.authService.fetchWithAuth(
      '/api/v4/contacts',
      'POST',
      [
        {
          name,
          custom_fields_values: [
            {
              field_id: 1439451,
              values: [
                {
                  value: phone,
                },
              ],
            },
            {
              field_id: 1439453,
              values: [
                {
                  value: email,
                },
              ],
            },
          ],
        },
      ],
    )
    const data = await response.json()
    if (response.status !== 200) throw new BadRequestException(data)
    return data._embedded.contacts[0].id
  }

  async update(
    id: number,
    name: string,
    email: string,
    phone: string,
  ): Promise<void> {
    const response = await this.authService.fetchWithAuth(
      '/api/v4/contacts/' + id,
      'PATCH',
      {
        name,
        custom_fields_values: [
          {
            field_id: 1439451,
            values: [
              {
                value: phone,
              },
            ],
          },
          {
            field_id: 1439453,
            values: [
              {
                value: email,
              },
            ],
          },
        ],
      },
    )
    if (response.status !== 200)
      throw new InternalServerErrorException(await response.json())
  }

  async createLead(id: number): Promise<void> {
    const response = await this.authService.fetchWithAuth(
      '/api/v4/leads',
      'POST',
      [
        {
          _embedded: {
            contacts: [
              {
                id,
              },
            ],
          },
        },
      ],
    )
    if (response.status !== 200)
      throw new InternalServerErrorException(await response.json())
  }

  async final(
    name: string,
    email: string,
    phone: string,
    searchBy?: 'email' | 'phone',
  ) {
    let id: number
    switch (searchBy) {
      case 'email':
        id = await this.find(email)
        break
      case 'phone':
        id = await this.find(phone)
        break
      default:
        id = await this.find(email, phone)
    }
    if (id) await this.update(id, name, email, phone)
    else id = await this.create(name, email, phone)

    await this.createLead(id)
  }
}
