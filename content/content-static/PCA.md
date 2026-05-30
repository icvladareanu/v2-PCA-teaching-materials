# 3. PCA Step-by-Step   


Finally, we reach the key point in our lesson that everything has been building up to: the PCA algorithm!
Here is a step-by-step tutorial of the process. Feel free to return to the prerequisite maths section if you are confused by any step.

## Overview
Before we dive in, let's revise the goal of PCA.
Many problems in Machine Learning involve huge {ref}`datasets <datasets>` - objects with thousands of {ref}`features <features>`. These datasets are very hard to understand, analyze, and visualize (see the {ref}`Curse of Dimensionality <curse-of-dimensionality>`). With PCA, we want to take a dataset with tons of features and reduce it to a lower-dimensional space, while keeping the most relevant information. We do this by finding the axes that account for the largest variance in the dataset.


```{tip} Why does keeping the largest variance mean keeping the most relevant information?
:class: dropdown
:open: false
:icon: true

Imagine you're analyzing a dataset of houses with features such as square meters and number of bedrooms. These two features are often strongly related: larger houses tend to have more bedrooms, while smaller houses tend to have fewer. As a result, they contain a lot of the same information.

When two features move together in this way, they are said to have a **high covariance**. Keeping both features may not provide much additional insight because they are largely describing the same underlying characteristic of the house: its overall size.

PCA solves this by looking at how the data varies. Covariance tells us which features move together and therefore contain redundant information. PCA instead focuses on variance, because variance measures how much the data differs across observations. A direction with high variance separates data points well and captures meaningful differences between them.

In the house example, PCA may combine both features (square meters and number of bedrooms) into a new variable that represents the overall size of the house. It then creates a new feature, called a principal component, which is a weighted combination of square meters and number of bedrooms. This way, PCA can capture most of the information contained in the original variables while removing their overlap.

```


## Step 1: Centering the Data
PCA finds the directions of maximum {ref}`variance <variance>` in the dataset. Because variance is inherently a measure of how data spreads out from its average, we first need to shift our dataset so that its {ref}`mean <mean>` sits exactly at the origin (zero).

This process is called **mean centering**. If we skip this step, the first Principal Component might simply point from the origin to the center of the data cloud, capturing the physical location of the data rather than its actual internal shape or spread.

To center the data, we calculate the mean of each feature across all data points, and subtract that mean from every value in that feature.

$$ \mathbf{X}_{\text{centered}} = \mathbf{X} - \mu $$

*Here, $\mathbf{X}$ is the dataset matrix and $\mu$ is the mean vector of the features.*

```{hint} Understanding This Step Intuitively
:class: dropdown
:open: false
:icon: true
Imagine taking a picture of a flock of birds flying high up in the sky. If your camera is fixed on the ground, your coordinates mostly tell you how far the flock is from the earth. Mean centering is like moving your camera right into the exact center of the flock. Now, every measurement describes how the birds are arranged relative to the center of the flock, making it easier to see the shape of the flock - how spread out it is, and in which directions it extends.
```



## Step 2: Calculating the Covariance Matrix
Next, we calculate the {ref}`covariance <covariance>` matrix to capture how each pair of features in the data varies together. This allows us to see how features relate to each other - whether they increase or decrease together.

The {ref}`covariance matrix <covariance-matrix>` $\mathbf{C}$ for a mean-centered data matrix $\mathbf{X}_{\text{centered}}$ with $n$ samples is calculated as:
$$ \mathbf{C} = \frac{1}{n-1} \mathbf{X}_{\text{centered}}^T \mathbf{X}_{\text{centered}} $$

```{hint} Understanding This Step Intuitively
:class: dropdown
:open: false
:icon: true
Let's look at the flock of birds again. Each bird is a data point, and its position is described by multiple features (for example: horizontal position, vertical position, depth etc.)  
The flock forms a cloud of points in space. This has a specific shape: it may be stretched in one direction, narrower in another, and possibly tilted relative to the original coordinate axes.   

The covariance matrix captures this structure feature by feature:
- The **diagonal entries** describe how spread out the flock is along each individual feature.  
  These are the **feature variances**, and they tell you how much variation exists in each direction (for example, how wide the flock is horizontally or vertically).
- The **off-diagonal entries** describe how pairs of features vary together.  
  These are the **covariances between features**. If birds that are further to the right also tend to be higher up, then the horizontal and vertical features are linked.   

  This is where **redundancy between features** appears: if one feature already gives you information about another, then both are partially describing the same underlying structure of the flock instead of contributing independent information.  

From this perspective, the covariance matrix is not just a table of numbers. It is a **map of both the geometry and the redundancy of the data**. It tells us:
- how the flock is stretched along each feature (variance), and  
- how much overlap exists between features in describing that shape (covariance).
```

## Step 3: Eigenvalue Decomposition
Given the covariance matrix $\mathbf{C}$ (which is a square, symmetric matrix), **eigenvalue decomposition** is the process of finding a set of scalars ({ref}`eigenvalues <eigenvalues>`) and vectors ({ref}`eigenvectors <eigenvectors>`) such that:
$$ \mathbf{C} \mathbf{v} = \lambda \mathbf{v} $$

*Here, $\mathbf{v}$ represents an eigenvector of matrix $\mathbf{C}$ and $\lambda$ represents its corresponding eigenvalue. We apply this procedure to find the eigenvalues and eigenvectors of our covariance matrix.*

```{hint} Understanding This Step Intuitively
:class: dropdown
:open: false
:icon: true
The covariance matrix describes the shape of the data cloud, including how features are spread out and how they are redundant with each other. **Eigenvalue decomposition** finds a new coordinate system where this structure becomes simpler/clearer.

When we solve
$$
\mathbf{C}\mathbf{v} = \lambda \mathbf{v}
$$
we find the **eigenvectors** of the covariance matrix. These are special directions that remain on their own span after transformation - multiplying them by $\mathbf{C}$ does not rotate them, it only scales (and possibly flips) them.   
This matters because this is a new set of **independent directions** that align with the true shape of the data cloud.  

For the flock of birds, instead of describing each bird using arbitrary horizontal/vertical/depth axes, the eigenvectors point along the flock’s real shape: the direction it is longest, the direction it is next most spread out, and the direction it is most compressed.   

For each eigenvector we find, its eigenvalue tells us how much the flock varies along the corresponding direction:
- large eigenvalue → the flock is highly stretched in that direction  
- small eigenvalue → little variation 
```



## Step 4: Finding Principal Components

Because the eigenvalues measure the data's variance in the direction of the corresponding eigenvectors, we can rank them. We sort the eigenvalues in descending order and keep only the top $k$ required Principal Components.
We can now construct a projection matrix $\mathbf{W}$: the matrix containing the chosen Principal Components as its columns.
$$ \mathbf{W} = \begin{bmatrix} | & | & & | \\ \mathbf{v}_1 & \mathbf{v}_2 & \dots & \mathbf{v}_k \\ | & | & & | \end{bmatrix} $$

So, the eigenvector with the highest eigenvalue will correspond to the first Principal Component (PC1). The second Principal Component (PC2) will be the eigenvector with the second highest eigenvalue, and so on.

```{hint} Understanding This Step Intuitively
:class: dropdown
:open: false
:icon: true
Remember: eigenvalues measure how strongly the flock is stretched along each direction.   

So when we rank them:
- PC1 is the direction where the flock is most spread out (for example, if the flock is elongated the most diagonally - from bottom-left to top-right - then PC1 aligns with that diagonal)
- PC2 is the next strongest direction of spread 
- PC3, PC4,… capture progressively weaker structure
```


## Step 5: Project the Data
Finally, we project the original data onto the dimensions represented by the selected Principal Components. This means we effectively reduce the number of features (dimensions) while keeping the most important patterns in the data!

To do this, we multiply the centered dataset by the matrix of eigenvectors found during the decomposition of the covariance matrix.
$$ \mathbf{X}_{\text{pca}} = \mathbf{X}_{\text{centered}} \mathbf{W} $$

*Here, $\mathbf{X}_{\text{centered}}$ is the centered data and $\mathbf{W}$ is the projection matrix containing the top $k$ eigenvectors as columns.*

Geometrically, this matrix multiplication effectively **projects the original data points onto the newly established orthogonal axes**.

```{hint} Understanding This Step Intuitively
:class: dropdown
:open: false
:icon: true
Think again of the bird flock, as a 3D ellipsoid floating in space, oriented along its principal directions (PC1, PC2, PC3).   
Projection means we “drop” the flock onto the lower-dimensional space defined by these principal components.   

For example:
- If we keep only PC1 and PC2, the 3D flock is flattened onto a 2D plane aligned with the main shape of the ellipsoid.
- Each bird is now described by where it lands on that plane instead of its original coordinates.
```

Ready to see PCA in action? Go to the next section to see a worked-out example.
