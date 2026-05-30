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


## Step 2: Calculating the Covariance Matrix
Next, we calculate the {ref}`covariance <covariance>` matrix to capture how each pair of features in the data varies together. This allows us to see how features relate to each other - whether they increase or decrease together.

The {ref}`covariance matrix <covariance-matrix>` $\mathbf{C}$ for a mean-centered data matrix $\mathbf{X}_{\text{centered}}$ with $n$ samples is calculated as:
$$ \mathbf{C} = \frac{1}{n-1} \mathbf{X}_{\text{centered}}^T \mathbf{X}_{\text{centered}} $$


## Step 3: Eigenvalue Decomposition
Given the covariance matrix $\mathbf{C}$ (which is a square, symmetric matrix), **eigenvalue decomposition** is the process of finding a set of scalars ({ref}`eigenvalues <eigenvalues>`) and vectors ({ref}`eigenvectors <eigenvectors>`) such that:
$$ \mathbf{C} \mathbf{v} = \lambda \mathbf{v} $$

*Here, $\mathbf{v}$ represents an eigenvector of matrix $\mathbf{C}$ and $\lambda$ represents its corresponding eigenvalue. We apply this procedure to find the eigenvalues and eigenvectors of our covariance matrix.*

```{tip} Eigenvectors and Eigenvalues: Intuition
:class: dropdown
:open: false
:icon: true
Eigenvectors indicate the directions of maximum variance in the data (the Principal Components), while eigenvalues quantify the magnitude of the variance captured by each of those Principal Components.
```



## Step 4: Finding Principal Components

Because the eigenvalues measure the data's variance in the direction of the corresponding eigenvectors, we can rank them. We sort the eigenvalues in descending order and keep only the top $k$ required Principal Components.
We can now construct a projection matrix $\mathbf{W}$: the matrix containing the chosen Principal Components as its columns.
$$ \mathbf{W} = \begin{bmatrix} | & | & & | \\ \mathbf{v}_1 & \mathbf{v}_2 & \dots & \mathbf{v}_k \\ | & | & & | \end{bmatrix} $$

So, the eigenvector with the highest eigenvalue will correspond to the first Principal Component (PC1). The second Principal Component (PC2) will be the eigenvector with the second highest eigenvalue, and so on.

```{tip} What is a Principal Component?
:class: dropdown
:open: false
:icon: true
A Principal Component is a new axis created from a linear combination of the original features. It is chosen to maximize the variance of the data projected onto it. 
```


## Step 5: Project the Data
Finally, we project the original data onto the dimensions represented by the selected Principal Components. This means we effectively reduce the number of features (dimensions) while keeping the most important patterns in the data!

To do this, we multiply the centered dataset by the matrix of eigenvectors found during the decomposition of the covariance matrix.
$$ \mathbf{X}_{\text{pca}} = \mathbf{X}_{\text{centered}} \mathbf{W} $$

*Here, $\mathbf{X}_{\text{centered}}$ is the centered data and $\mathbf{W}$ is the projection matrix containing the top $k$ eigenvectors as columns.*

Geometrically, this matrix multiplication effectively **projects the original data points onto the newly established orthogonal axes**.



Ready to see PCA in action? Go to the next section to see a worked-out example.
