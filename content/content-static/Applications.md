# 4. PCA Applied  

 
Let’s apply the PCA algorithm to a simple worked example.

## Problem statement
We are given the following 2D dataset (each row is a data point with two features):

$$
\mathbf{X} =
\begin{bmatrix}
2 & 0 \\
0 & 2 \\
3 & 1 \\
1 & 3
\end{bmatrix}
$$

Our goal is to reduce this dataset from 2 dimensions to 1 dimension while preserving as much structure as possible.


## Step 1: Centering the Data
First, compute the mean of each feature:

$$
\mu_1 = \frac{2 + 0 + 3 + 1}{4} = 1.5,
\quad
\mu_2 = \frac{0 + 2 + 1 + 3}{4} = 1.5
$$

Now subtract the mean from each corresponding value to center the data around the origin $(0,0)$:

$$
\mathbf{X}_{\text{centered}} =
\begin{bmatrix}
2 - 1.5 & 0 - 1.5 \\
0 - 1.5 & 2 - 1.5 \\
3 - 1.5 & 1 - 1.5 \\
1 - 1.5 & 3 - 1.5
\end{bmatrix}
=
\begin{bmatrix}
0.5 & -1.5 \\
-1.5 & 0.5 \\
1.5 & -0.5 \\
-0.5 & 1.5
\end{bmatrix}
$$


## Step 2: Calculating the Covariance Matrix
The covariance matrix $\mathbf{C}$ for a sample is computed as:

$$
\mathbf{C} = \frac{1}{n-1} \mathbf{X}_{\text{centered}}^T \mathbf{X}_{\text{centered}}
$$
Where $n=4$. 

First, we compute the matrix multiplication $\mathbf{X}_{\text{centered}}^T \mathbf{X}_{\text{centered}}$:

$$
\mathbf{X}_{\text{centered}}^T \mathbf{X}_{\text{centered}} =
\begin{bmatrix}
0.5 & -1.5 & 1.5 & -0.5 \\
-1.5 & 0.5 & -0.5 & 1.5
\end{bmatrix}
\begin{bmatrix}
0.5 & -1.5 \\
-1.5 & 0.5 \\
1.5 & -0.5 \\
-0.5 & 1.5
\end{bmatrix}
$$

Divide the resulting matrix by $n-1 = 3$:

$$
\mathbf{C} = \frac{1}{3}
\begin{bmatrix}
5 & -3 \\
-3 & 5
\end{bmatrix}
=
\begin{bmatrix}
5/3 & -1 \\
-1 & 5/3
\end{bmatrix}
\approx
\begin{bmatrix}
1.67 & -1.00 \\
-1.00 & 1.67
\end{bmatrix}
$$


## Step 3: Eigenvalue Decomposition

We solve for the eigenvalues $\lambda$ using **the characteristic equation $\det(\mathbf{C} - \lambda \mathbf{I}) = 0$:**

$$
\det \left(
\begin{bmatrix}
\frac{5}{3} - \lambda & -1 \\
-1 & \frac{5}{3} - \lambda
\end{bmatrix}
\right) = 0
$$

$$
\left(\frac{5}{3} - \lambda\right)^2 - (-1)(-1) = 0
$$

$$
\left(\frac{5}{3} - \lambda\right)^2 = 1
\quad \Rightarrow \quad
\frac{5}{3} - \lambda = \pm 1
$$

This gives us our two eigenvalues:

$$
\lambda_1 = \frac{8}{3} \approx 2.67,
\quad
\lambda_2 = \frac{2}{3} \approx 0.67
$$

Next, we find the eigenvectors by solving

$$
(\mathbf{C} - \lambda \mathbf{I}) \mathbf{v} = 0.
$$

For $\lambda_1 = \frac{8}{3}$:

$$
\begin{bmatrix}
-1 & -1 \\
-1 & -1
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
0 \\
0
\end{bmatrix}
\quad \Rightarrow \quad
-x - y = 0
\quad \Rightarrow \quad
x = -y
$$

Normalizing this vector to have length 1 gives:

$$
\mathbf{v}_1 =
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\
-1
\end{bmatrix}
$$

For $\lambda_2 = \frac{2}{3}$, applying the same process yields:

$$
\mathbf{v}_2 =
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\
1
\end{bmatrix}
$$

## Step 4: Finding Principal Components
We select the eigenvector associated with the largest eigenvalue ($\lambda_1 = 2.67$). 

So the first Principal Component is:

$$
\mathbf{W} =
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 \\
-1
\end{bmatrix}
$$

This represents the direction in the 2D space along which our data varies the most.

## Step 5: Project the Data
To reduce our dataset to 1D, we project the centered data onto the principal component by taking the dot product:

$$
\mathbf{X}_{\text{pca}} = \mathbf{X}_{\text{centered}} \mathbf{W}
$$

$$
\mathbf{X}_{\text{pca}} =
\begin{bmatrix}
0.5 & -1.5 \\
-1.5 & 0.5 \\
1.5 & -0.5 \\
-0.5 & 1.5
\end{bmatrix}
\begin{bmatrix}
1/\sqrt{2} \\
-1/\sqrt{2}
\end{bmatrix}
$$

Calculating the projection for each point:
* **Point 1:** $0.5(1/\sqrt{2}) + (-1.5)(-1/\sqrt{2}) = \frac{2}{\sqrt{2}} = \sqrt{2} \approx 1.41$
* **Point 2:** $-1.5(1/\sqrt{2}) + 0.5(-1/\sqrt{2}) = \frac{-2}{\sqrt{2}} = -\sqrt{2} \approx -1.41$
* **Point 3:** $1.5(1/\sqrt{2}) + (-0.5)(-1/\sqrt{2}) = \frac{2}{\sqrt{2}} = \sqrt{2} \approx 1.41$
* **Point 4:** $-0.5(1/\sqrt{2}) + 1.5(-1/\sqrt{2}) = \frac{-2}{\sqrt{2}} = -\sqrt{2} \approx -1.41$

Result:

$$
\mathbf{X}_{\text{pca}} =
\begin{bmatrix}
1.41 \\
-1.41 \\
1.41 \\
-1.41
\end{bmatrix}
$$

Each scalar value represents the coordinate of the corresponding point along the new 1D principal axis. Geometrically, this corresponds to projecting all points onto a single line that best captures the structural variance of the data.

## Conclusion
We have reduced a 2D dataset to 1D while successfully preserving the direction of maximum variance.

You have now completed this tutorial. Congratulations!
