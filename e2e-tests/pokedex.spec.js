const { test, expect } = require('@playwright/test')

test.describe('Pokedex', () => {
  async function setupRequestInterception(page) {
    await page.route('**/pokeapi.co/**', async route => {
      const url = route.request().url()

      if (url.includes('pokemon?limit=50') || url.includes('pokemon/?limit=50')) {
        const mockResponse = {
          count: 1118,
          next: null,
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
            { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
            { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
            { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
            { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' }
          ]
        }

        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mockResponse)
        })
      }
      else if (url.match(/pokemon\/\d+/) || url.match(/pokemon\/[a-zA-Z]+/)) {

        const mockDetailResponse = {
          id: 2,
          name: 'ivysaur',
          base_experience: 142,
          height: 10,
          weight: 130,
          abilities: [
            {
              ability: {
                name: 'overgrow',
                url: 'https://pokeapi.co/api/v2/ability/65/'
              },
              is_hidden: false,
              slot: 1
            },
            {
              ability: {
                name: 'chlorophyll',
                url: 'https://pokeapi.co/api/v2/ability/34/'
              },
              is_hidden: true,
              slot: 3
            }
          ],
          stats: [
            {
              base_stat: 60,
              effort: 0,
              stat: {
                name: 'hp',
                url: 'https://pokeapi.co/api/v2/stat/1/'
              }
            },
            {
              base_stat: 62,
              effort: 0,
              stat: {
                name: 'attack',
                url: 'https://pokeapi.co/api/v2/stat/2/'
              }
            },
            {
              base_stat: 63,
              effort: 0,
              stat: {
                name: 'defense',
                url: 'https://pokeapi.co/api/v2/stat/3/'
              }
            },
            {
              base_stat: 80,
              effort: 0,
              stat: {
                name: 'special-attack',
                url: 'https://pokeapi.co/api/v2/stat/4/'
              }
            },
            {
              base_stat: 80,
              effort: 0,
              stat: {
                name: 'special-defense',
                url: 'https://pokeapi.co/api/v2/stat/5/'
              }
            },
            {
              base_stat: 60,
              effort: 0,
              stat: {
                name: 'speed',
                url: 'https://pokeapi.co/api/v2/stat/6/'
              }
            }
          ],
          types: [
            {
              slot: 1,
              type: {
                name: 'grass',
                url: 'https://pokeapi.co/api/v2/type/12/'
              }
            },
            {
              slot: 2,
              type: {
                name: 'poison',
                url: 'https://pokeapi.co/api/v2/type/4/'
              }
            }
          ],
          sprites: {
            front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
            back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
            front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png',
            back_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/2.png'
          }
        }

        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mockDetailResponse)
        })
      }
      else {
        await route.continue()
      }
    })
  }

  test('front page can be opened', async ({ page }) => {
    test.setTimeout(120000)
    await setupRequestInterception(page)

    await page.goto('/')
    await page.waitForTimeout(2000)

    await expect(page.getByText('ivysaur', { exact: false })).toBeVisible()
    await expect(
      page.getByText('Pokémon and Pokémon character names are trademarks of Nintendo.')
    ).toBeVisible()
  })

  test('can navigate to individual pokemon page', async ({ page }) => {
    test.setTimeout(120000)

    await setupRequestInterception(page)

    await page.goto('/')
    await page.waitForTimeout(2000)

    await page.getByText('ivysaur', { exact: false }).first().click()

    await page.waitForURL('**/pokemon/**', { timeout: 10000 })

    await page.waitForTimeout(3000)

    await expect(page.locator('.pokemon-name')).toHaveText('ivysaur')

    await expect(page.locator('.pokemon-ability-name:has-text("chlorophyll")')).toBeVisible()
  })
})