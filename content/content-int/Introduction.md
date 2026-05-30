---
abstract: |
    Principal Component Analysis (PCA) is a widely used dimensionality reduction technique used in Machine Learning and Statistics. It is an unsupervised method that helps reduce the complexity of data by transforming it into a lower-dimensional space, making patterns and relationships within the data easier to understand, while preserving the most relevant information.
---

# 1. Introduction

**Machine Learning (ML)** is a field of study that focuses on designing algorithms that learn patterns directly from data. Rather than relying on explicitly programmed rules, machine learning systems use data to automatically identify relationships, detect structure, and make predictions or decisions.

At the core of ML lies **data**. To use a data object in a machine learning algorithm, we must represent it numerically. But how do we represent a real-world object so that a mathematical function can process it?

(features)=
### Features
A *feature* is a measurable property or characteristic of an object. Features provide the numerical representation that allows machine learning algorithms to process real-world data. All features describing an object are combined into a vector, called a *feature vector*.

```{admonition}  Example: a house object
:class: dropdown
:open: true
:icon: false
Suppose we want to buy a house. We describe the house as an object using a few numbers (features):

- x₁: Size (in square meters) = 120  
- x₂: Number of rooms = 4  
- x₃: Year of construction = 1980  

Then the corresponding feature vector is:
\begin{bmatrix}
120 \\
4 \\
1980
\end{bmatrix}
```


(datasets)=
### Dataset
A *dataset* is a collection of objects (also called data points or samples), where each object is described by a fixed set of features. Mathematically, a dataset is often represented as a matrix in which rows correspond to objects and columns correspond to features.

```{admonition}  Example: a dataset of houses
:class: dropdown
:open: true
:icon: false
Consider a dataset of three houses described by three features:

| Object  | Size (sq meters) | Number of rooms | Year of construction |
| :------ | :--------------- | :-------------- | :------------------- |
| House 1 | 120              | 4               | 1980                 |
| House 2 | 85               | 3               | 2005                 |
| House 3 | 150              | 5               | 1995                 |

Each row represents one house (a specific object or data point), and each column represents a specific feature.
```

```{tip}  The Row vs. Column Convention
:class: dropdown
:open: false
:icon: true
Notice how the two examples above use different conventions for vector notation. This is a common difference between mathematics and Machine Learning:

- **Linear Algebra (Column Convention):** In mathematical notation, a vector (also the house **feature** vector from the example above) is conventionally written as a *column*. If an object has $d$ features, it is represented as a $d \times 1$ column vector.
- **Machine Learning (Row Convention):** When we combine multiple objects into a single dataset matrix, the standard convention is to represent each object/vector as a *row*. Therefore, an $N \times d$ dataset matrix contains $N$ objects (rows) and $d$ features (columns).

To bridge these conventions mathematically, an object $\mathbf{x}$ represented as a column vector is transposed ($\mathbf{x}^\top$) when it is inserted as a row into the dataset matrix.
```


### Dimensionality
In Machine Learning, the number of features an object has dictates the number of *dimensions* of the mathematical space it occupies.

To build a strong intuition for techniques like PCA, we must translate how we view data from a flat list of numbers into a geometric space. Every time you add a new feature to your dataset, you are adding a new perpendicular axis to your graph:

- **1 feature (1D):** The object is a 1D vector. Geometrically, this is a single point on a number line, where the value of $x_1$ dictates its exact position.
- **2 features (2D):** The object is a 2D vector. Geometrically, this represents a point in a standard XY coordinate system. The first feature value ($x_1$) provides the coordinate on the horizontal axis, and the second feature value ($x_2$) provides the coordinate on the vertical axis.
- **3 features (3D):** The object is a 3D vector. The point now exists in a 3D volume, with three distinct coordinates dictating its position across the XYZ coordinate system.
- **$n$ features ($n$-D):** The object is an $n$-dimensional vector. While we cannot easily visualize more than three dimensions, the mathematical logic remains identical: the point is located in an abstract $n$-dimensional space, defined by $n$ specific numerical coordinates.

```{figure} figures/dimensionality.*
:label: fig-dimensionality
:alt: A visual representation of how data sparsity increases from 1D (split into 4 regions) to 2D (split into 16 regions) to 3D (split into 64 regions).

*Figure 1.* A visual representation of how data sparsity increases from 1D (split into 4 regions) to 2D (split into 16 regions) to 3D (split into 64 regions). This illustrates how adding features (dimensions) exponentially increases the available space, causing the number of data points in one region to become increasingly sparse.   
Source: @deepai2019
```

(curse-of-dimensionality)=
### The Curse of Dimensionality
The *curse of dimensionality* refers to the collection of problems that arise when working with high-dimensional data, when data becomes increasingly sparse as dimensions increase.

To intuitively understand why high dimensions hurt machine learning models, consider the relationship between dimensions, available space, and data sparsity shown in *Figure 1*.

Imagine we have a fixed set of 20 data points (represented by the red and green dots). Let's watch what happens to the exact same data as we add features:

- In 1D (a): We only look at 1 feature. If we divide our number line into 4 distinct sub-regions, our 20 data points are packed tightly together. Every single region is crowded with data, making it very easy for a Machine Learning algorithm to see patterns and find neighbors.
- In 2D (b): We add a second feature, expanding the line into a square grid. Because each of our 2 axes is divided into 4 regions, the total number of sub-regions jumps exponentially to $4^2 = 16$. Notice how the exact same 20 points are now scattered across a wider plane. Empty regions begin to appear.
- In 3D (c): We add a third feature, expanding our flat grid into a 3D cube. The total space increases to $4^3 = 64$ sub-regions. Suddenly, our 20 data points look isolated. The vast majority of the 64 regions are completely empty.


In practical terms, this creates a major bottleneck in data science and Machine Learning. High-dimensional spaces come with multiple challenges:

- Data is difficult to visualize: Human intuition breaks down beyond 3D.
- Data becomes isolated: Points become so spread out that the distance between any two points becomes virtually equal, making distance-based algorithms (like clustering) fail.
- Models overfit: With so much empty space, ML models can overfit, i.e. find random, meaningless patterns in the data that don't actually exist.
- Higher data requirements: Accurately modeling high-dimensional data often requires exponentially more samples to achieve reliable generalization.



## Enter: PCA
To address the curse of dimensionality, we need a way to reduce the number of features while keeping the most important information in the data.

Principal Component Analysis (PCA) achieves this by constructing a smaller set of new features that summarize the original data, allowing us to represent the same information in fewer dimensions without significant loss of information.

```{figure} figures/pca-overview.*
:label: fig-pca
:alt: Figure of PCA

*Figure 2.* Dimensionality reduction with PCA (provided here for intuition; the method is explained in detail in later chapters).

Source: @tiwari2025
```

Before we can understand how PCA works, we first need to review some essential mathematical concepts from linear algebra and statistics. These foundations are covered in the next chapter.


+++
