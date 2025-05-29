const path = require('path')
require('dotenv').config()

module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      platforms: ['darwin', 'linux'],
      config: {
        repository: {
          owner: process.env.GITHUB_REPOSITORY_OWNER,
          name: process.env.GITHUB_REPOSITORY_NAME,
          token: process.env.GITHUB_TOKEN
        },
        prerelease: false,
        draft: true
      }
    }
  ],

  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, 'resources', 'icon'),
    extraResources: [
      {
        from: path.join(__dirname, 'resources'), // Caminho para a pasta resources
        to: 'resources', // Copia a pasta resources para o diretório de build
        filter: ['**/*'] // Certifica-se de que todos os arquivos dentro de resources sejam copiados
      }
    ]
  },

  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Suite-Device',
        version: '1.9.9',
        setupExe: 'Suite-Device.exe',
        appIconPath: path.join(__dirname, 'resources', 'icon.ico'),
        loadingGif: path.join(__dirname, 'resources', 'db.gif'),
        iconUrl:
          'https://raw.githubusercontent.com/DhioneCastilhoBarbosa/suite-device-app/main/resources/icon.ico',
        setupIcon: path.join(__dirname, 'resources', 'icon.ico'),
        noMsi: true
      }
    },

    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'suite-device',
          productName: 'Suite Device',
          version: '1.9.8',
          arch: 'x64',
          icon: path.join(__dirname, 'resources', 'icon.png'),
          categories: ['Utility'],
          maintainer: 'Seu Nome <seuemail@example.com>',
          homepage: 'https://github.com/DhioneCastilhoBarbosa/suite-device-app',
          description: 'Aplicação Suite Device para gestão de dispositivos.',
          section: 'utility'
        }
      }
    },

    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'suite-device',
          productName: 'Suite Device',
          version: '1.9.7',
          arch: 'x86_64',
          icon: path.join(__dirname, 'resources', 'icon.png'),
          homepage: 'https://github.com/DhioneCastilhoBarbosa/suite-device-app',
          license: 'MIT',
          description: 'Aplicação Suite Device para gestão de dispositivos.',
          group: 'Utility'
        }
      }
    }
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
}
