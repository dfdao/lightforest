# Light Forest - Custom Dark Forest Arena Rounds

Light Forest is the simplest way to create a custom branded [Dark Forest Arena](https://medium.com/dfdao/dark-forest-arena-14c47bfd4e8) round for your own community. It creates a website and game client for you automatically so you can focus on building your perfect game.

## Requirements

- Install `node >= 14` (Consider using [nvm](https://github.com/nvm-sh/nvm))
- Install [Yarn](https://classic.yarnpkg.com/en/docs/install)

## Install

Click the link below to create a new repo from the Light Forest template.

> https://github.com/dfdao/lightforest/generate

Or, if you have the [GitHub CLI](https://cli.github.com/):

```bash
gh repo create <new-repo-name> --template="dfdao/lightforest"
```

Clone that new repo to your local machine.

## Setting up a round

1. Visit [arena.dfdao.xyz/arena](https://arena.dfdao.xyz/arena) and create a map. Once the map is created, you will get a unique hash of the map's configuration. Copy this value and save it for later.
2. Customize `lightforest.toml`. See [Customization](#customization) for details.
3. Add a `.env` file using the same keys as `.env.example`
4. Run `yarn && yarn start`

Your custom round should be running locally at `localhost:8081`. Once you're ready to deploy, jump to [Deployment](#deployment) and follow the instructions.

## Customization

To change the client or game rules—like score calculation—you can edit the React components in this repository. To perform deeper modifications, like changing smart contracts or packages, use [darkforest-local](https://github.com/dfdao/darkforest_local). See [Builder's Guide](#builders-guide) for more details about deep customization.

### Round details

`lightforest.toml` provides a fair amount of customizability out of the box.

- Title
- Description
- Org name (e.g. "dfdao")
- Start time
- End time
- Move weight
- Time weight
- Ranks

This repo comes with a pre-populated example:

```toml
[round]
END_TIME = "2022-08-13T00:00:00.000Z"
START_TIME = "2022-07-13T00:00:00.000Z"

DESCRIPTION = "this is an amazing map!"
MOVE_WEIGHT = 1
TIME_WEIGHT = 1
TITLE = "The Amazing Map"
ORG_NAME = "dfdao"

BRONZE_RANK = 180
CONFIG_HASH = '0xfe719a3cfccf2bcfa23f71f0af80a931eda4f4197331828d728b7505a6156930'
GOLD_RANK = 60
SILVER_RANK = 120

```

### Styling

All styles for the round page are defined in `src/Frontend/Styles/lightforest.scss`.
Most elements on the homepage have a data-attribute (starting with `lf-`) that can be used for styling.

For example,

```html
<div lf-map-overview="">...</div>
```

can be styled with the following CSS selector:

```CSS
[lf-map-overview] {
  ...
}
```

The color scheme is also defined in `lightforest.scss` as CSS variables.

## Deployment

The following guides assume you've went through the following checklist before deploying:

### Deployment checklist

- [ ] You've set up the environment variables correctly
- [ ] You're using the correct round parameters in `lightforest.toml`
- [ ] You're configured the visual design to fit the look and feel of your custom round. (`lightforest.scss`)
- [ ] You've changed the favicons and header tags in `index.html`.
- [ ] You've tested the experience locally.

### Netlify

1. Push your code to your git repository.
2. [Import your site](https://docs.netlify.com/welcome/add-new-site/) into Netlify from your git repository.
3. Make sure the build command is set to `yarn build` and the publish directory to `dist`.
4. Save and deploy
5. Your custom round should be live at something like `https://lightforest-site.netlify.app/ `

### Netlify (CLI)

1. [Install the Netlify CLI](https://cli.netlify.com/).
2. Run `ntl init` to create a new site.
3. Deploy your site with `ntl deploy --prod`.

## Builder's Guide

For a comprehensive tutorial on using the [Dark Forest](https://github.com/dfdao/darkforest-local) repository to make custom Dark Forest games and deploy them, check out the Dark Forest [Builder's Guide](builders_guide.md).
