using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;

namespace Teknavo.Models
{
    public static class DataFactory
    {
        // this const used to set size of loaded data portion
        // in case of 100 element - we can load em all at once
        // but in case of 10^10 elements it could be hard to handle all array on a client side
        // so, let it be a portion from very begining :)
        private const int COUNT_OF_ELEMENTS_PER_REQ = 5;

        public static void CreateMatrix(string description, int dimension, IList<short> elements)
        {
            using (var context = new DataContext())
            {
                try
                {
                    // try find matrix in database
                    var matrix = context.Matrix.FirstOrDefault(a => a.Description == description);
                    if (matrix == null)
                    {
                        // if matrix not found, create it and add to db
                        AddMatrix(description, dimension, elements, context);
                    }
                    else
                    {
                        // if matrix exists, update it
                        UpdateMatrix(matrix, dimension, elements, context);
                    }

                    context.SaveChanges();
                }
                catch (DbEntityValidationException e)
                {
                    // let handle errors
                    // this catch section will handle DbEntityValidationException
                    // becouse we are not using any logging subsystem let try to output error in console
                    // this is usefull for debug purposes :)
                    foreach (var eve in e.EntityValidationErrors)
                    {
                        Console.WriteLine(
                            "Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                            eve.Entry.Entity.GetType().Name, eve.Entry.State);
                        foreach (var ve in eve.ValidationErrors)
                        {
                            Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                                              ve.PropertyName, ve.ErrorMessage);
                        }
                    }
                }
                catch (Exception e)
                {
                    // other exception are handled here
                    Console.WriteLine("Exception occured: {0}; {1}", e.Message, e.StackTrace);
                }
            }
        }

        private static void AddMatrix(string description, int dimension, IList<short> elements, DataContext context)
        {
            var matrix = new Matrix
                {
                    Description = description,
                    Dimension = dimension,
                    Elements = new List<MatrixElement>()
                };
            AddElements(elements, matrix);
            context.Matrix.Add(matrix);
        }

        private static void UpdateMatrix(Matrix matrix, int dimension, IList<short> elements, DataContext context)
        {
            matrix.Dimension = dimension;
            RemoveElements(matrix, context);
            AddElements(elements, matrix);
        }

        private static void RemoveElements(Matrix matrix, DataContext context)
        {
            foreach (var element in matrix.Elements.ToList())
            {
                context.MatrixElements.Remove(element);
            }
        }

        private static void AddElements(IList<short> elements, Matrix matrix)
        {
            for (var i = 0; i < elements.Count(); i++)
            {
                var element = new MatrixElement() {Index = i, Value = elements[i]};
                matrix.Elements.Add(element);
            }
        }

        public static List<Matrix> GetMatrixList()
        {
            using (var context = new DataContext())
            {
                var result = context.Matrix.ToList();
                return result;
            }
        }

        public static List<MatrixElement> GetElements(int matrixId, int lastLoadedIdx)
        {
            // COUNT_OF_ELEMENTS_PER_REQ - used to show loading of data with multiple ajax requests
            // for example in case than amount of data is too big and we want to do it async
            // in our case elements have an index and matrix is (n;n)
            // every element could be defenetly referenced by index (started from 0)
            // we are reading the portion of data per request

            if (lastLoadedIdx < 0)
            {
                lastLoadedIdx = 0;
            }

            using (var context = new DataContext())
            {
                var result = context.MatrixElements
                                    .Where(
                                        e =>
                                        e.MatrixId == matrixId && e.Index >= lastLoadedIdx &&
                                        e.Index < lastLoadedIdx + COUNT_OF_ELEMENTS_PER_REQ)
                                    .OrderBy(e => e.Index)
                                    .ToList();
                return result;
            }
        }

        public static void DeleteMatrix(int matrixId)
        {
            using (var context = new DataContext())
            {
                var matrix = context.Matrix.FirstOrDefault(a => a.MatrixId == matrixId);
                if (matrix == null) return;

                try
                {
                    RemoveElements(matrix, context);
                    context.Matrix.Remove(matrix);
                    context.SaveChanges();
                }
                catch (DbEntityValidationException e)
                {
                    // let handle errors
                    // this catch section will handle DbEntityValidationException
                    // becouse we are not using any logging subsystem let try to output error in console
                    // this is usefull for debug purposes :)
                    foreach (var eve in e.EntityValidationErrors)
                    {
                        Console.WriteLine(
                            "Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                            eve.Entry.Entity.GetType().Name, eve.Entry.State);
                        foreach (var ve in eve.ValidationErrors)
                        {
                            Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                                              ve.PropertyName, ve.ErrorMessage);
                        }
                    }
                }
                catch (Exception e)
                {
                    // other exception are handled here
                    Console.WriteLine("Exception occured: {0}; {1}", e.Message, e.StackTrace);
                }
            }
        }
    }
}