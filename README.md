## What is it

Traffic analyst is a simulation of a line of car traffic. It represent how traffic can slow down and create traffic jam without any more obstacle (traffic waves), and how driver behavior can have an impact on this.

## Install

```
npm install
```

## Launch

```
npm run dev
```

## Test

```
npm run test
npm test -- src/logic/carLogic/carlib.test.js # single test
```


## Screenshot

![screenshot](screenshot.png)

## Misc

Built using svelte, typescript, jsdoc

Tags :
Rule 184, stop waves

Useful websites :
zeperfs.com
www.auto-data.net
tirecalculator.com
taille-pneu.com
www.auto-abc.eu/


## Contrib

### Art

#### Blender

Origin point of the car body on the wheel level and centered
Empty for each wheel named Wheel#R or Wheel#L
Shade smooth
Auto Smooth around 20°

#### Pixel scale

1m50 -> 50 pixels

### Texture

First 5 pixels define the colors palette than can be altered to change the car color
1 : base
2 : darker
3 : lighter
4 : darker+
5 : lighter+
