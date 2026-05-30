# 2.3. Statistical Foundations


(mean)=
## Mean
The *mean* (or average) is a measure of the central tendency of a dataset. It represents the value around which the data is centered, and it is calculated by summing up all the values in the dataset and dividing them by the number of values. 

For a dataset $x_1, x_2, \dots, x_n$, the mean is:

$$
\mu = \frac{1}{n} \sum_{i=1}^{n} x_i
$$


```{admonition} Example: Calculating the mean
:class: dropdown
:open: false
Given data: $[2, 4, 6, 8]$

Calculate the mean:
$$
\mu = \frac{2 + 4 + 6 + 8}{4} = 5
$$
```

(variance)=
## Variance
*Variance* measures how spread out a dataset is around its mean. It quantifies how much the values deviate from the average value; in other words, variance indicates how much the values differ from the mean.

For a dataset $x_1, x_2, \dots, x_n$, the sample variance is:

$$
\sigma^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \mu)^2
$$

A high variance means the data is widely spread, while a low variance means the data is tightly clustered around the mean.


```{admonition} Example: Calculating variance
:class: dropdown
:open: false
Given data: $[2, 4, 6, 8]$

First compute the mean:
$$
\mu = \frac{2 + 4 + 6 + 8}{4} = 5
$$

Next compute the *deviations*, which are the differences between each value and the mean:

$$
x_i - \mu = [-3, -1, 1, 3]
$$

Square the deviations:

$$
[9, 1, 1, 9]
$$

Then compute the variance:

$$
\sigma^2 = \frac{9 + 1 + 1 + 9}{3} = 6.67
$$
```


```{figure} figures/var.*
:label: fig-variance
:alt: Variance of projected data.

Figure 1: The effect of projection axis orientation on data variance. The left panel shows datapoints being projected onto an axis that captures high variance, as the points remain widely separated along the new axis. The right panel shows datapoints being projected onto an axis that captures low variance, as the new points collapse close to each other and lose the distinct differences between them.   
Source: @courseML2025
```

```{tip} How is this related to PCA?
:class: dropdown
:open: false

1. Left Diagram: "Projected data has largest variance"
- What is happening: The red line is aligned with the primary direction of the data's spread.
- The Result: When the points are projected perpendicularly onto this line, they land far apart from each other. The projected data retains a high variance (spread).
- Relation to PCA: PCA is fundamentally a dimensionality reduction method; it aims to compress data into fewer dimensions while keeping the most critical structural information intact. To do this, PCA relies on the mathematical principle that variance represents information - PCA searches for the exact axis that maximizes the data spread. 

2. Right Diagram: "Projected data has small variance"
- What is happening: The red line is oriented perpendicular to the main spread of the data.
- The Result: When the points are projected onto this line, they collapse closely together, projecting into a tight cluster. The projected data has a small variance.
- Relation to PCA: Because the points overlap heavily on this axis, we lose the ability to distinguish the individual samples from one another. Geometrically, projecting data this way destroys its original shape. For PCA, directions that capture minimal variance correspond to directions that carry the least amount of useful information and are typically discards them - which is exactly how PCA successfully compresses data without losing its meaning.
```


(covariance)=
## Covariance
*Covariance* measures how two variables change together. It indicates whether increases in one variable correspond to increases or decreases in another.
If the variables tend to increase or decrease simultaneously, covariance is positive. If one increases while the other decreases, covariance is negative. Zero covariance means that there is no linear relationship between the variables.

For two variables $x$ and $y$ with means $\mu_x$ and $\mu_y$, the sample covariance is:

$$
\mathrm{cov}(x,y)
=
\frac{1}{n-1} \sum_{i=1}^{n} (x_i - \mu_x)(y_i - \mu_y)
$$


```{admonition} Example: Calculating covariance
:class: dropdown
:open: false
Given two variables:

$x = [1, 2, 3]$, $y = [2, 4, 6]$

First compute the means:

$$
\mu_x = 2, \quad \mu_y = 4
$$

Next compute the *deviations* (distance from the mean for each value):

$x - \mu_x = [-1, 0, 1]$

$y - \mu_y = [-2, 0, 2]$

Now multiply corresponding deviations:

$[2, 0, 2]$

Finally, compute covariance:

$$
\mathrm{cov}(x,y) = \frac{2 + 0 + 2}{2} = 2
$$
```


