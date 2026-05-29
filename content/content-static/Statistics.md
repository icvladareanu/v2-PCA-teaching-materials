# Statistical Foundations


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

Large vs. small variance of projected datapoints.
Source: @courseML2025
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


