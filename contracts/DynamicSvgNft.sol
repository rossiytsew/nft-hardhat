// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {

    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) s_tokenIdToHighValue;
    string private constant BASE64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";
    string private constant BASE64_ENCODED_JSON_PREFIX = "data:application/json;base64,";

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(address priceFeed, string memory lowSvg, string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        i_priceFeed = AggregatorV3Interface(priceFeed);
        s_tokenCounter = 0;
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded));
    }

    function _baseURI() internal pure override returns (string memory) {
        return BASE64_ENCODED_JSON_PREFIX;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = i_lowImageURI;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes":[{"trait_type":"coolness", "vaue": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}