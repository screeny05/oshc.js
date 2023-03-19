import React from 'react';
import { useGm1File } from '../../../sprites/data-loader';
import Spritesheet from '../../atoms/Spritesheet';
import './index.css';

type Font =
  | 'aaXLarge'
  | 'aaLarge'
  | 'aaMedium'
  | 'aaSmall'
  | 'aaXSmall'
  | 'defaultBig'
  | 'defaultSmall'
  | 'defaultAA';

interface TypoProps {
  text: string;
  font?: Font;
  test?: boolean;
  className?: string;
  letterSpacing?: number;
  lineHeight?: number | 'auto';
  showOrnamentalInitial?: boolean;
}

interface FontMapCharacter {
  char: string;
  index: number;
  offsetY: number;
}

interface FontMap {
  spritesheet: string;
  character: Record<string, FontMapCharacter>;
  tofu: FontMapCharacter;
  spaceWidth: number;
}

const stringToMap = (
  val: string,
  spritesheet: string,
  offsets: number[],
  indexOffset: number,
  spaceWidth: number
): FontMap => {
  return {
    spritesheet,
    character: Object.fromEntries(
      val
        .split('')
        .map((char, i) => [
          char,
          { char, index: indexOffset + i, offsetY: offsets[i] ?? 0 },
        ])
    ),
    tofu: {
      char: TOFU_CHARACTER,
      index: val.indexOf(TOFU_CHARACTER) + indexOffset,
      offsetY: 0,
    },
    spaceWidth,
  };
};

const TOFU_CHARACTER = '�';

const FONT_AA_CHARACTERS =
  '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~�ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ¿¡ĄĆĘŁŃŚŹŻąćęłńśźż';

const FONT_DEFAULT_CHARACTERS =
  '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~�ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';

const FONT_CHARACTER_OFFSETS_BIG = [
  //                         *   +   ,   -   .  ;
  2, 2, 4, 0, 0, 0, 0, 0, 0, 8, 10, 29, 15, 30, 0, 2, 1, 2, 2, 0, 2, 1, 1, 1, 1,
  //   ;   <   =  >
  12, 12, 9, 12, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //                   Z                 _
  0, 0, 0, 0, 0, 0, 0, 0, -5, 0, -5, 0, 29, -5,
  // a                           j                                    t
  13, 0, 13, 0, 13, 0, 13, 0, 1, 0, 0, 0, 13, 13, 13, 13, 13, 13, 13, 11, 13,
  //   w   x   y   z   {   |   }  ~       `    ´   ^   ~   ¨   ° AE  C    `
  13, 13, 13, 13, 13, -4, -4, -4, 0, 0, -12, -12, -9, -6, -6, -8, 0, 0, -12,
  //´
  -12,
  //   ¨                             `    ´   ^   ~   ¨          `    ´   ^   ¨
  -9, -6, -12, -12, -8, -6, 0, -6, -12, -12, -9, -6, -6, 0, 0, -12, -12, -9, -6,
  //    Þ  ß  `  ´  ^  ~  ¨  °  AE   c  `  ´  ^  ¨  `  ´  ^  ¨        `
  -12, -0, 0, 0, 0, 4, 8, 8, 4, 14, 14, 0, 0, 4, 8, 0, 0, 4, 8, 2, 8, 0, 0, 4,
  // ö         `  ´  ^  ¨  ý  þ  ÿ  ¿  ¡
  8, 8, 0, 14, 0, 0, 4, 8, 0, 0, 8, 0, 0, 0, -12, 0, 0, -12, -12, -12, -8, 14,
  //
  0, 14, 0, 0, 0, 0, 6,
];

const FONT_MAP_AA_XLARGE = stringToMap(
  FONT_AA_CHARACTERS,
  'font_stronghold_aa',
  FONT_CHARACTER_OFFSETS_BIG,
  0,
  15
);
const FONT_MAP_AA_LARGE = stringToMap(
  FONT_AA_CHARACTERS,
  'font_stronghold_aa',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => offset * 0.7),
  FONT_AA_CHARACTERS.length,
  10
);
const FONT_MAP_AA_MEDIUM = stringToMap(
  FONT_AA_CHARACTERS,
  'font_stronghold_aa',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => Math.ceil(offset * 0.5)),
  FONT_AA_CHARACTERS.length * 2,
  7
);
const FONT_MAP_AA_SMALL = stringToMap(
  FONT_AA_CHARACTERS,
  'font_stronghold_aa',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => Math.ceil(offset * 0.38)),
  FONT_AA_CHARACTERS.length * 3,
  7
);
const FONT_MAP_AA_XSMALL = stringToMap(
  FONT_AA_CHARACTERS,
  'font_stronghold_aa',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => Math.ceil(offset * 0.25)),
  FONT_AA_CHARACTERS.length * 4,
  7
);
const FONT_MAP_DEFAULT_BIG = stringToMap(
  FONT_DEFAULT_CHARACTERS,
  'font_stronghold',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => Math.ceil(offset * 0.6)),
  0,
  15
);
const FONT_MAP_DEFAULT_SMALL = stringToMap(
  FONT_DEFAULT_CHARACTERS,
  'font_stronghold',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => Math.ceil(offset * 0.3)),
  FONT_DEFAULT_CHARACTERS.length,
  15
);
const FONT_MAP_DEFAULT_AA = stringToMap(
  FONT_DEFAULT_CHARACTERS,
  'font_stronghold',
  FONT_CHARACTER_OFFSETS_BIG.map((offset) => Math.ceil(offset * 0.25)),
  FONT_DEFAULT_CHARACTERS.length * 2,
  8
);

const FONT_MAPS: Record<Font, FontMap> = {
  aaXLarge: FONT_MAP_AA_XLARGE,
  aaLarge: FONT_MAP_AA_LARGE,
  aaMedium: FONT_MAP_AA_MEDIUM,
  aaSmall: FONT_MAP_AA_SMALL,
  aaXSmall: FONT_MAP_AA_XSMALL,

  defaultAA: FONT_MAP_DEFAULT_AA,
  defaultBig: FONT_MAP_DEFAULT_BIG,
  defaultSmall: FONT_MAP_DEFAULT_SMALL,
};

export default function Typo({
  className,
  text: value,
  font,
  test,
  letterSpacing = 0.025,
  lineHeight = 1.6,
  showOrnamentalInitial = false,
}: TypoProps) {
  font ??= 'aaLarge';
  const fontMap = FONT_MAPS[font] ?? FONT_MAPS.aaLarge;
  const gm1 = useGm1File(fontMap.spritesheet);
  const emHeight = gm1?.images[fontMap.character.M.index].h ?? 10;
  value = test
    ? FONT_AA_CHARACTERS // 'AÀÁÂÃÄÅÆCÇÈÉÊËEIÌÍÎÏDÐNÑOÒÓÔÕÖØUÙÚÛÜYÝÞßBCDEFGHIJKLMNOPQRSTUVWXYZAĄCĆEĘLŁNŃSŚZŹŻaàáâãäåæcçeèéêëiìíîïðnñoòóôõöøuùúûüyýÿþaącćeęlłnńsśzźż{|}~�¿¡'
    : value;
  const words = value.split(' ').map((word) => [...word.split(''), ' ']);
  const ornamentIndex = font === 'aaSmall' ? 19 : 18;

  return (
    <div
      className={`${className ?? ''} typo typo--${font} ${
        showOrnamentalInitial ? 'typo--with-ornament' : ''
      }`}
      style={
        {
          '--lineHeight':
            lineHeight === 'auto'
              ? 'inherit'
              : emHeight + (lineHeight - 1) * emHeight + 'px',
          '--letterSpacing': letterSpacing * emHeight + 'px',
        } as any
      }
    >
      {showOrnamentalInitial && value ? (
        <Spritesheet
          className="typo__ornament"
          spritesheet="interface_icons3"
          index={ornamentIndex}
        />
      ) : null}

      {words.map((chars, i) => (
        <div className="typo__word" key={i}>
          {chars.map((char, j) => {
            const character = fontMap.character[char] ?? fontMap.tofu;
            const key = `${value}:${j}`;
            const isOrnamentedInitial =
              showOrnamentalInitial && i === 0 && j === 0;

            if (char === ' ') {
              return (
                <div
                  className="typo__char"
                  style={{ width: fontMap.spaceWidth }}
                  key={key}
                />
              );
            }

            return (
              <Spritesheet
                className={`typo__char ${
                  isOrnamentedInitial ? 'typo__char--ornamented' : ''
                }`}
                spritesheet={fontMap.spritesheet}
                maskIndex={character.index}
                maskColor="magenta"
                key={key}
                style={{
                  marginTop: character.offsetY,
                  background: 'currentColor',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
