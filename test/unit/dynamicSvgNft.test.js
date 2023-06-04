const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const lowSvgImageURI = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggZD0iTTQgMEgwdjEwaDR2Nmg2di00aDZWMEg0em0yIDE0VjJoOHYxaC0ydjJoMnYxaC0ydjJoMnYySDh2NEg2ek0yIDhWMmgydjZIMnoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPg0KPC9zdmc+"
const lowTokenURI = "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHRoYXQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgQ2hhaW5saW5rIEZlZWQiLCAiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ImNvb2xuZXNzIiwgInZhdWUiOiAxMDB9XSwgImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCbWFXeHNQU0lqTURBd01EQXdJaUIzYVdSMGFEMGlPREJ3ZUNJZ2FHVnBaMmgwUFNJNE1IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UWWdNVFlpSUhodGJHNXpQU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh5TURBd0wzTjJaeUkrRFFvZ0lDQWdQSEJoZEdnZ1pEMGlUVFFnTUVnd2RqRXdhRFIyTm1nMmRpMDBhRFpXTUVnMGVtMHlJREUwVmpKb09IWXhhQzB5ZGpKb01uWXhhQzB5ZGpKb01uWXlTRGgyTkVnMmVrMHlJRGhXTW1neWRqWklNbm9pSUdacGJHd3RjblZzWlQwaVpYWmxibTlrWkNJdlBnMEtQQzl6ZG1jKyJ9"
const highSvgImageURI = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggZD0iTTQgMTZIMFY2aDRWMGg2djRoNnYxMkg0ek02IDJ2MTJoOHYtMWgtMnYtMmgydi0xaC0yVjhoMlY2SDhWMkg2ek0yIDh2NmgyVjhIMnoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPg0KPC9zdmc+"
const highTokenURI = "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHRoYXQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgQ2hhaW5saW5rIEZlZWQiLCAiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ImNvb2xuZXNzIiwgInZhdWUiOiAxMDB9XSwgImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCbWFXeHNQU0lqTURBd01EQXdJaUIzYVdSMGFEMGlPREJ3ZUNJZ2FHVnBaMmgwUFNJNE1IQjRJaUIyYVdWM1FtOTRQU0l3SURBZ01UWWdNVFlpSUhodGJHNXpQU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh5TURBd0wzTjJaeUkrRFFvZ0lDQWdQSEJoZEdnZ1pEMGlUVFFnTVRaSU1GWTJhRFJXTUdnMmRqUm9Obll4TWtnMGVrMDJJREoyTVRKb09IWXRNV2d0TW5ZdE1tZ3lkaTB4YUMweVZqaG9NbFkyU0RoV01rZzJlazB5SURoMk5tZ3lWamhJTW5vaUlHWnBiR3d0Y25Wc1pUMGlaWFpsYm05a1pDSXZQZzBLUEM5emRtYysifQ=="

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", () => {
        let dynamicSvgNft, deployer, mockV3Aggregator

        beforeEach(async () => {
            accounts = ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "dynamicsvg"])
            dynamicSvgNft = await ethers.getContract("DynamicSvgNft")
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        })

        describe("constructor", () => {
            it("sets starting values correctly", async () => {
                const lowSvg = await dynamicSvgNft.getLowSvg()
                const highSvg = await dynamicSvgNft.getHighSvg()
                const priceFeed = await dynamicSvgNft.getPriceFeed()
                assert.equal(lowSvg, lowSvgImageURI)
                assert.equal(highSvg, highSvgImageURI)
                assert.equal(priceFeed, mockV3Aggregator.address)
            })
        })

        describe("mintNft", () => {
            it("emits an event and creates the high NFT", async () => {
                const highValue = ethers.utils.parseEther("1")
                await expect(dynamicSvgNft.mintNft(highValue)).to.emit(
                    dynamicSvgNft,
                    "CreatedNFT"
                )
                const tokenCounter = await dynamicSvgNft.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
                const tokenURI = await dynamicSvgNft.tokenURI(0)
                assert.equal(tokenURI, highTokenURI)
            })
            it("emits an event and creates the low NFT", async () => {
                const highValue = ethers.utils.parseEther("201")
                await expect(dynamicSvgNft.mintNft(highValue)).to.emit(
                    dynamicSvgNft,
                    "CreatedNFT"
                )
                const tokenCounter = await dynamicSvgNft.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
                const tokenURI = await dynamicSvgNft.tokenURI(0)
                assert.equal(tokenURI, lowTokenURI)
            })
        })
    })