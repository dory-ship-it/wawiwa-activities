with	sales_cte
		as
		(
		select	d.ProductID,
			p.[Name] as ProductName,
			YEAR(h.OrderDate) as SaleYear,
			SUM (d.LineTotal) as TotalAmount,
			SUM (d.OrderQty) as TotalQty,
			SUM (d.LineTotal-p.StandardCost*d.OrderQty) as TotalProfit
		from Sales.SalesOrderDetail d
			join Production.Product p
				on d.ProductID = p.ProductID
			join Sales.SalesOrderHeader h
				on h.SalesOrderID = d.SalesOrderID
		group by d.ProductID, p.[Name], YEAR(h.OrderDate)
		)
select	top 5
		ProductName,
		SUM (case when SaleYear = 2012 then TotalProfit end) as Profit2012,
		SUM (case when SaleYear = 2013 then TotalProfit end) as Profit2013
from sales_cte
where SaleYear between 2012 and 2013
group by ProductName
order by Profit2013 desc
