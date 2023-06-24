<p align="center">
    <img width=100 height=100 src="https://github.com/Jordy3D/CBViewer/assets/19144524/b1d74fde-e004-490b-b44a-a88b5115b10b">
    <br/>
    A format proposal for a CBZ/CBR alternative, as well as a simple viewer for it.
</p>

---

## Format

### About

CBZ and CBR files are fine and all, but the lack of metadata, as well as the constant "do I use chapters or volumes?" question makes it a bit annoying to use when keeping track of reading progress and the like.  
A CBV file tries to solve this by acting as a "volume" container for CBZ files, as well as containing a metadata file and a cover image.  
My implementation is a bit weird, unzipping the CBV into a folder, then unzipping the CBZ files into a folder inside that folder, but it works. 

Ultimately, this is just a proposal, and I don't expect it to be widely adopted, but I think it's a neat idea. It would be nice to see some actual applications use this format, but I don't have the time or skill to make one myself.

### Structure

The structure of a CBV file is as follows:

```txt
Example Volume.cbv
├── cover.jpg
├── details.json
├── Chapter 1.cbz
├── Chapter 2.cbz
¦
└── Chapter N.cbz
```

### Metadata

Below is an example of the metadata file, based on the [No Guns Life](https://www.viz.com/no-guns-life) manga (since that's what I'm currently reading):

```json
{
    "series": "No Guns Life",
    "author": "Tasuku Karasuma",
    "artist": "Tasuku Karasuma",
    "description": "When a fellow Extended showed up in Inui’s office—on the run from the Security Bureau with a kidnapped child in tow and asking for help—Inui almost throws the guy out. But Inui’s loyalty to a brother Extended makes him take the job. Keeping the child safe won’t be easy, since everyone wants him, from the mob to the megacorporation Berühren, which sends out a special agent who knows exactly how to deal with the Extended…\n\n(Source: Viz Media)",

    "volume_title": "Volume 1",
    "volume": 1,

    "release_date": "2019-09-17",
    "isbn": "978-1-9747-1388-2",

    "genre": [
      "Action",
      "Drama",
      "Sci-Fi"
    ],

    "chapters": [
        "Renegade Extended",
        "Remote Controlled Extended",
        "Negotiation",
        "Puppet",
        "Lost",
        "Trigger"
    ]
  }
```

An example CBV dile is available in the root of this repo, appropriately called `Example.cbv`.  

---

## Viewer

`readCBV.py` is a simple viewer for CBV files. Uses an (admittedly bad) Tkinter GUI.  
I might make a better one in the future, but this is just a proof of concept.  
`detailsCBV.py` is a simple script to print the metadata of a CBV file.

### Features

- Can open CBV files as well as CBZ files
- Resize page to fit window (including spreads)
- That's about it

### Issues

- Resizing is super slow
- The first page always fails to resize, but will work if you toggle pages
- The GUI is ugly and barebones  
- The code is a mess

### Screenshots
Or... GIF, actually. Just a quick demonstration:  
<p align="center">
    <img src="https://github.com/Jordy3D/CBViewer/assets/19144524/eaac6fcf-5c1a-4602-901d-5c888bfa4a22">
</p>
