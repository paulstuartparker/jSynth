# waveShaper

WaveShaper is a fully functional digital synthesizer built in javascript.
check out the live version [Here](https://paulstuartparker.github.io/waveShaper/ "here")

## Implementation

waveShaper makes extensive use of the web audio api, some dsp techniques, and an organized but intricate audio graph for the routing.
There are two oscillators, which generate the signal, as well as a low-frequency oscillator which generates a sine wave and modulates volume 
based on another oscillators frequency.  

The signal is then processed through various audio nodes and effects, and ultimately routed to the speakers as well as an audio
analyser node, which generates the waveform display with the use of a method called getByteTimeData and canvas. 

![delay](delay.gif)

It makes extensive use of the web audio api, as well as a library for the keyboard called 'querty hancock'.  In building this project
I relied on the expertise of Chris Wilson and Chris Lowis who both have extensive materials on the subject posted on the internet.  
I also heavily relied on the MDN docs for information about the web audio api.  

## Design

The UI is an original design which I created from scratch.  The layout follows the signal flow of the wave generated by the oscillators,
through the filters, and finally to the speakers and waveform display.  

I also implemented a help feature, allowing users to hover their mouse over a component's title if they want more information 
about how to use it.

![modal](modal.gif)
