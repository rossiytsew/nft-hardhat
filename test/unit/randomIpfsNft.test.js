const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Tests", () => {
        let randomIpfsNft, deployer, vrfCoordinatorV2Mock

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "randomipfs"])
            randomIpfsNft = await ethers.getContract("RandomIpfsNft")
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        })

        describe("constructor", () => {
            it("sets starting values correctly", async () => {
                const dogTokenUriZero = await randomIpfsNft.getTokenUri(0)
                const isInitialized = await randomIpfsNft.getInitialized()
                assert(dogTokenUriZero.includes("ipfs://"))
                assert.equal(isInitialized, true)
            })
        })

        describe("requestNft", () => {
            it("fails if payment isn't sent with the request", async () => {
                await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                    "RandomIpfsNft__NeedMoreETHSent"
                )
            })
            it("reverts if payment amount is less than the mint fee", async () => {
                const mintFee = await randomIpfsNft.getMintFee()
                await expect(randomIpfsNft.requestNft({ 
                    value: mintFee.sub(ethers.utils.parseEther("0.001")) 
                })).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent")
            })
            it("emits an event and kicks off a random word request", async () => {
                const mintFee = await randomIpfsNft.getMintFee()
                await expect(randomIpfsNft.requestNft({ 
                    value: mintFee.toString() 
                })).to.emit(randomIpfsNft, "NftRequested")
            })
        })

        describe("fulfillRandomWords", () => {
            it("mints NFT after random number is returned", async () => {
                await new Promise(async (resolve, reject) => {
                    randomIpfsNft.once("NftMinted", async () => {
                        try {
                            const tokenUri = await randomIpfsNft.tokenURI("0")
                            const tokenCounter = await randomIpfsNft.getTokenCounter()
                            assert(tokenUri.toString().includes("ipfs://"))
                            assert.equal(tokenCounter.toString(), "1")
                            resolve()
                        } catch (error) {
                            console.log(error)
                            reject(error)
                        }
                    })

                    try {
                        const mintFee = await randomIpfsNft.getMintFee()
                        const requestNftResponse = await randomIpfsNft.requestNft({ 
                            value: mintFee.toString()
                        })
                        const requestNftReceipt = await requestNftResponse.wait(1)
                        await vrfCoordinatorV2Mock.fulfillRandomWords(
                            requestNftReceipt.events[1].args.requestId,
                            randomIpfsNft.address
                        )
                    } catch (error) {
                        console.log(error)
                        reject(error)
                    }
                })
            })
        })
    })