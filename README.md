# Analyzing the Emotions of Reddit Communities

[Live project link](https://6859-sp21.github.io/final-project-emotion-reddit-posts/visualization)

## Collaboration
This project was completed by the following students:

Felix Dumont
- Data pre-processing
- Intro page
- Deep-Dive of Emotions in Reddit Posts page
- Additional details page
- Paper

Taylor Facen
- Data pre-processing
- Analyzing Related Subreddits
- Project page
- 1-minute video

## Project Process
1) Picking the dataset. We opted for a text dataset because we wanted to leverage the complexity of such datasets. However, we also wanted something broader and possibly more uplifting than a hate speech dataset. For these reasons, we picked this fine-grained emotions dataset.
2) Arc graph. After picking the dataset, we first had to decide on what question we would like to answer. Because the data focused on Reddit posts and their sentiment, we knew that providing insights on the types of emotions in different subreddits would be important to do. Also, we knew that some sort of network chart would be helpful to see how different communities are related to each other. This chart was the hardest to do since there's so much data. In the end, we opted to use an arc diagram to demonstrate how subreddits are connected to each other.
3) Emotion deep-dive. We go in full details in the paper on our design decisions for this section, but in short we attempted multiple ways to display (simply) the emotions of this dataset and ended up with a combination of a Sankey diagram, a gauge chart and dynamic text. This required significant attempts to maintain simplicity and expressiveness.  