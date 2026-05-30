(covariance-matrix)=
# 2.4. The Covariance Matrix  


The *covariance matrix* describes how every pair of features in a dataset varies together.

For a dataset with $d$ features, the covariance matrix is a $d \times d$ matrix where each entry measures the covariance between two features.

---

## Definition

For features $x_i$ and $x_j$, the entry in the covariance matrix is:

$$
\mathbf{C}_{ij} = \mathrm{cov}(x_i, x_j)
$$

$$
\mathbf{C} =
\begin{bmatrix}
\mathrm{var}(x_1) & \mathrm{cov}(x_1, x_2) & \cdots & \mathrm{cov}(x_1, x_d) \\
\mathrm{cov}(x_2, x_1) & \mathrm{var}(x_2) & \cdots & \mathrm{cov}(x_2, x_d) \\
\vdots & \vdots & \ddots & \vdots \\
\mathrm{cov}(x_d, x_1) & \mathrm{cov}(x_d, x_2) & \cdots & \mathrm{var}(x_d)
\end{bmatrix}
$$

where:

- diagonal entries ($i = j$) represent the variance of a single feature  
- off-diagonal entries ($i \neq j$) represent how two different features vary together  

---

## Interpretation

The covariance matrix summarizes the structure of a dataset:

- Large positive values → features increase together  
- Large negative values → one feature increases while the other decreases  
- Values near zero → weak or no linear relationship  

The diagonal shows how much each feature varies individually, while the off-diagonal terms show how features relate to each other.


```{figure} figures/covariance.*
:label: fig-covariance
:alt: Covariance of data.

*Figure 5.* Three scatter plots demonstrating positive, near-zero, and negative covariance patterns. 
In a two-variable system, these patterns describe the behavior of the off-diagonal entries $C_{12} = \text{cov}(x_1, x_2)$ and $C_{21} = \text{cov}(x_2, x_1)$ in the covariance matrix. Positive covariance indicates a direct linear relationship (sloping upward), negative covariance indicates an inverse linear relationship (sloping downward), and near-zero covariance implies the features do not share a clear linear dependency.   
Adapted from source: @mathmonks2025
```
---

## Key take-away

The covariance matrix captures all *linear relationships* between features in a dataset in a single object.
