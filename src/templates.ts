export const createTemplate = (name: string, email: string, phone: string) => [
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
]

export const updateTemplate = (name: string, email: string, phone: string) => ({
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
})

export const createLeadTemplate = (id: number) => [
  {
    _embedded: {
      contacts: [
        {
          id,
        },
      ],
    },
  },
]
